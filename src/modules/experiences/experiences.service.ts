import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import type { CreateExperienceInput, UpdateExperienceInput } from './experiences.schema';

export class ExperiencesService {
  async findAll() {
    return prisma.experience.findMany({
      orderBy: [{ current: 'desc' }, { startDate: 'desc' }],
    });
  }

  async findById(id: string) {
    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      throw new NotFoundError(`Experience with ID ${id} not found`);
    }
    return experience;
  }

  async create(input: CreateExperienceInput) {
    return prisma.experience.create({
      data: {
        company: input.company,
        position: input.position,
        description: input.description,
        startDate: input.startDate,
        endDate: input.current ? null : (input.endDate ?? null),
        current: input.current ?? false,
      },
    });
  }

  async update(id: string, input: UpdateExperienceInput) {
    await this.findById(id);

    return prisma.experience.update({
      where: { id },
      data: {
        ...(input.company !== undefined ? { company: input.company } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
        ...(input.current !== undefined
          ? {
              current: input.current,
              ...(input.current ? { endDate: null } : {}),
            }
          : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.experience.delete({ where: { id } });
  }
}

export const experiencesService = new ExperiencesService();
