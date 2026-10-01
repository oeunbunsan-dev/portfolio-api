import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import type { CreateEducationInput, UpdateEducationInput } from './educations.schema';

export class EducationsService {
  async findAll() {
    return prisma.education.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const education = await prisma.education.findUnique({ where: { id } });
    if (!education) {
      throw new NotFoundError(`Education record with ID ${id} not found`);
    }
    return education;
  }

  async create(input: CreateEducationInput) {
    return prisma.education.create({
      data: {
        school: input.school,
        degree: input.degree,
        field: input.field,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
      },
    });
  }

  async update(id: string, input: UpdateEducationInput) {
    await this.findById(id);

    return prisma.education.update({
      where: { id },
      data: {
        ...(input.school !== undefined ? { school: input.school } : {}),
        ...(input.degree !== undefined ? { degree: input.degree } : {}),
        ...(input.field !== undefined ? { field: input.field } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.education.delete({ where: { id } });
  }
}

export const educationsService = new EducationsService();
