import { Prisma } from '@prisma/client';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import { calculatePagination } from '@/utils/response';
import type { CreateContactInput, ContactQueryInput } from './contacts.schema';

export class ContactsService {
  async create(input: CreateContactInput) {
    return prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        subject: input.subject,
        message: input.message,
      },
    });
  }

  async findAll(query: ContactQueryInput) {
    const { page = 1, limit = 10, search, isRead } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {
      ...(isRead !== undefined ? { isRead } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const meta = calculatePagination(total, page, limit);
    return { data: messages, meta };
  }

  async findById(id: string, autoMarkRead = true) {
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundError(`Contact message with ID ${id} not found`);
    }

    if (autoMarkRead && !message.isRead) {
      return prisma.contactMessage.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return message;
  }

  async updateStatus(id: string, isRead: boolean) {
    await this.findById(id, false);

    return prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });
  }

  async delete(id: string) {
    await this.findById(id, false);
    return prisma.contactMessage.delete({ where: { id } });
  }
}

export const contactsService = new ContactsService();
