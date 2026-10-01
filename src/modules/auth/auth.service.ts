import { Role } from '@prisma/client';
import { prisma } from '@/database/client';
import { hashPassword, comparePassword } from '@/utils/password';
import { ConflictError, UnauthorizedError } from '@/utils/error';
import type { RegisterInput, LoginInput } from './auth.schema';

interface JwtSigner {
  sign: (payload: any) => Promise<string>;
  verify: (token: string) => Promise<any>;
}

export class AuthService {
  async register(
    input: RegisterInput,
    jwtAccess: JwtSigner,
    jwtRefresh: JwtSigner
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
        avatar: input.avatar ?? null,
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user, jwtAccess, jwtRefresh);

    return {
      user,
      ...tokens,
    };
  }

  async login(
    input: LoginInput,
    jwtAccess: JwtSigner,
    jwtRefresh: JwtSigner
  ) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    const tokens = await this.generateTokens(safeUser, jwtAccess, jwtRefresh);

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async refreshToken(
    rawRefreshToken: string,
    jwtAccess: JwtSigner,
    jwtRefresh: JwtSigner
  ) {
    const payload = await jwtRefresh.verify(rawRefreshToken);
    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: rawRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Revoke used refresh token for token rotation
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    const safeUser = {
      id: tokenRecord.user.id,
      name: tokenRecord.user.name,
      email: tokenRecord.user.email,
      avatar: tokenRecord.user.avatar,
      role: tokenRecord.user.role,
      createdAt: tokenRecord.user.createdAt,
    };

    const tokens = await this.generateTokens(safeUser, jwtAccess, jwtRefresh);

    return tokens;
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    await prisma.refreshToken.updateMany({
      where: { token: rawRefreshToken },
      data: { revoked: true },
    });
  }

  private async generateTokens(
    user: { id: string; email: string; role: Role },
    jwtAccess: JwtSigner,
    jwtRefresh: JwtSigner
  ) {
    const accessToken = await jwtAccess.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await jwtRefresh.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
    };
  }
}

export const authService = new AuthService();
