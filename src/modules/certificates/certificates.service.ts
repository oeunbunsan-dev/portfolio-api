import { prisma } from '@/database/client';
import { NotFoundError } from '@/utils/error';
import type { CreateCertificateInput, UpdateCertificateInput } from './certificates.schema';

export class CertificatesService {
  async findAll() {
    return prisma.certificate.findMany({
      orderBy: { issueDate: 'desc' },
    });
  }

  async findById(id: string) {
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) {
      throw new NotFoundError(`Certificate with ID ${id} not found`);
    }
    return cert;
  }

  async create(input: CreateCertificateInput) {
    return prisma.certificate.create({
      data: {
        title: input.title,
        issuer: input.issuer,
        issueDate: input.issueDate,
        credentialUrl: input.credentialUrl ?? null,
      },
    });
  }

  async update(id: string, input: UpdateCertificateInput) {
    await this.findById(id);

    return prisma.certificate.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.issuer !== undefined ? { issuer: input.issuer } : {}),
        ...(input.issueDate !== undefined ? { issueDate: input.issueDate } : {}),
        ...(input.credentialUrl !== undefined ? { credentialUrl: input.credentialUrl } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.certificate.delete({ where: { id } });
  }
}

export const certificatesService = new CertificatesService();
