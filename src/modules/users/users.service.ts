import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/database/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/utils/error';
import { hashPassword, comparePassword } from '@/utils/password';
import { calculatePagination } from '@/utils/response';
import type { UpdateProfileInput, UserQueryInput, UpdateUserRoleInput } from './users.schema';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar;
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new BadRequestError('Current password is required to set a new password');
      }

      const isCurrentValid = await comparePassword(input.currentPassword, user.password);
      if (!isCurrentValid) {
        throw new BadRequestError('Current password does not match');
      }

      updateData.password = await hashPassword(input.newPassword);
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(query: UserQueryInput) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const meta = calculatePagination(total, page, limit);
    return { data: users, meta };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: string, input: UpdateUserRoleInput, currentUserId: string) {
    if (id === currentUserId && input.role !== Role.ADMIN) {
      throw new ForbiddenError('You cannot remove admin privileges from your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    return prisma.user.update({
      where: { id },
      data: { role: input.role },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    return prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }
}

export const usersService = new UsersService();
