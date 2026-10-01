import { Prisma } from '@prisma/client';
import { prisma } from '@/database/client';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/error';
import { calculatePagination } from '@/utils/response';
import type { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from './projects.schema';

export class ProjectsService {
  async findAll(query: ProjectQueryInput) {
    const { page = 1, limit = 10, search, featured, technology, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(featured !== undefined ? { featured } : {}),
      ...(technology ? { technologies: { has: technology } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    const meta = calculatePagination(total, page, limit);
    return { data: projects, meta };
  }

  async findByIdOrSlug(identifier: string) {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });

    if (!project) {
      throw new NotFoundError(`Project '${identifier}' not found`);
    }

    return project;
  }

  async create(input: CreateProjectInput) {
    let slug = input.slug ? slugify(input.slug) : slugify(input.title);

    // Ensure slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return prisma.project.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        content: input.content,
        image: input.image ?? null,
        githubUrl: input.githubUrl ?? null,
        liveUrl: input.liveUrl ?? null,
        featured: input.featured ?? false,
        technologies: input.technologies,
      },
    });
  }

  async update(id: string, input: UpdateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = slugify(input.slug);
      const duplicate = await prisma.project.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Project with slug '${slug}' already exists`);
      }
    } else if (input.title && !input.slug && input.title !== existing.title) {
      slug = slugify(input.title);
      const duplicate = await prisma.project.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    return prisma.project.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        slug,
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
        ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
        ...(input.liveUrl !== undefined ? { liveUrl: input.liveUrl } : {}),
        ...(input.featured !== undefined ? { featured: input.featured } : {}),
        ...(input.technologies !== undefined ? { technologies: input.technologies } : {}),
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    return prisma.project.delete({
      where: { id },
    });
  }
}

export const projectsService = new ProjectsService();
