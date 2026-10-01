import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from './social-links.schema';

export class SocialLinksService {
  async findAll() {
    return prisma.socialLink.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const link = await prisma.socialLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundError(`Social link with ID ${id} not found`);
    }
    return link;
  }

  async create(input: CreateSocialLinkInput) {
    return prisma.socialLink.create({
      data: {
        platform: input.platform,
        url: input.url,
      },
    });
  }

  async update(id: string, input: UpdateSocialLinkInput) {
    await this.findById(id);

    return prisma.socialLink.update({
      where: { id },
      data: {
        ...(input.platform !== undefined ? { platform: input.platform } : {}),
        ...(input.url !== undefined ? { url: input.url } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.socialLink.delete({ where: { id } });
  }
}

export const socialLinksService = new SocialLinksService();
