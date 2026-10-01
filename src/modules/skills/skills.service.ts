import { Prisma } from '@prisma/client';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import type { CreateSkillInput, UpdateSkillInput, SkillQueryInput } from './skills.schema';

export class SkillsService {
  async findAll(query: SkillQueryInput) {
    const { category, search, sortBy = 'proficiency', sortOrder = 'desc' } = query;

    const where: Prisma.SkillWhereInput = {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    return prisma.skill.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async findById(id: string) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundError(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async create(input: CreateSkillInput) {
    return prisma.skill.create({
      data: {
        name: input.name,
        category: input.category,
        icon: input.icon ?? null,
        proficiency: input.proficiency ?? 80,
      },
    });
  }

  async update(id: string, input: UpdateSkillInput) {
    await this.findById(id);

    return prisma.skill.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.proficiency !== undefined ? { proficiency: input.proficiency } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.skill.delete({ where: { id } });
  }
}

export const skillsService = new SkillsService();
