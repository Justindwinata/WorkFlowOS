import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt.interface';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AccountSecurityService } from './account-security.service';
import { TotpService } from './totp.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export type LoginResult =
  | { requires2FA: true; userId: string; email: string; message: string }
  | {
      user: {
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        permissions: string[];
      };
      accessToken: string;
      refreshToken: string;
    };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private accountSecurity: AccountSecurityService,
    private totpService: TotpService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new ConflictException('Email atau username sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let workspace = await this.prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await this.prisma.workspace.create({
        data: { name: 'Default Workspace', slug: 'default-workspace' },
      });
    }

    let memberRole = await this.prisma.role.findUnique({ where: { name: 'member' } });
    if (!memberRole) {
      memberRole = await this.prisma.role.create({
        data: {
          name: 'member',
          description: 'Default member role',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        workspaceId: workspace.id,
        roleId: memberRole.id,
      },
      include: { role: { include: { permissions: true } } },
    });

    await this.prisma.userWorkspace.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        roleId: memberRole.id,
        current: true,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      workspaceId: user.workspaceId,
      version: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions: (user.role.permissions as any).map((p: any) => p.name),
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const lockKey = `login:${dto.email}`;
    if (this.accountSecurity.isLocked(lockKey)) {
      throw new UnauthorizedException('Akun terkunci sementara setelah terlalu banyak percobaan gagal');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      this.accountSecurity.recordFailure(lockKey);
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.accountSecurity.recordFailure(lockKey);
      throw new UnauthorizedException('Email atau password salah');
    }

    this.accountSecurity.clearFailures(lockKey);

    // Check if user has TOTP enabled
    if (user.totpSecret) {
      return {
        requires2FA: true,
        userId: user.id,
        email: user.email,
        message: '2FA required. Please provide TOTP code.',
      };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      workspaceId: user.workspaceId,
      version: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions: (user.role.permissions as any).map((p: any) => p.name),
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, status: true, deletedAt: true, tokenVersion: true },
      });

      if (!user || user.status !== 'active' || user.deletedAt) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      if (payload.version !== user.tokenVersion) {
        throw new UnauthorizedException('Refresh token telah di-revoke');
      }

      const tokens = await this.tokenService.generateTokenPair(payload);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  async revokeUserSessions(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { id: true, tokenVersion: true },
    });

    return {
      message: 'Sesi berhasil direvoke',
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Password saat ini salah');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
    });

    await this.revokeUserSessions(userId);

    return { message: 'Password berhasil diubah, semua sesi direvoke' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      twoFactorEnabled: !!user.totpSecret,
      permissions: (user.role.permissions as any).map((p: any) => p.name),
    };
  }

  async setup2FA(userId: string, email: string) {
    const { secret, otpauthUrl } = this.totpService.generateSecret(email);
    const qrCode = await this.totpService.generateQrCode(otpauthUrl);
    return { secret, qrCode, message: 'Scan QR code dengan authenticator app, lalu verifikasi dengan kode 6 digit' };
  }

  async enable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('TOTP belum diatur, jalankan /2fa/setup terlebih dahulu');
    }

    const valid = this.totpService.verifyToken(user.totpSecret, token);
    if (!valid) {
      throw new UnauthorizedException('Kode TOTP tidak valid');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    return { message: '2FA berhasil diaktifkan', twoFactorEnabled: true };
  }

  async disable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('TOTP tidak aktif');
    }

    const valid = this.totpService.verifyToken(user.totpSecret, token);
    if (!valid) {
      throw new UnauthorizedException('Kode TOTP tidak valid');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: null, tokenVersion: { increment: 1 } },
    });

    return { message: '2FA berhasil dinonaktifkan', twoFactorEnabled: false };
  }

  async verify2FACode(userId: string, secret: string, token: string) {
    const valid = this.totpService.verifyToken(secret, token);
    if (!valid) {
      throw new UnauthorizedException('Kode TOTP tidak valid');
    }
    return { valid: true, message: 'Kode valid' };
  }

  async verify2FALogin(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('User tidak ditemukan atau tidak aktif');
    }

    if (!user.totpSecret) {
      throw new UnauthorizedException('TOTP belum diaktifkan');
    }

    const valid = this.totpService.verifyToken(user.totpSecret, token);
    if (!valid) {
      throw new UnauthorizedException('Kode TOTP tidak valid');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      workspaceId: user.workspaceId,
      version: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions: (user.role.permissions as any).map((p: any) => p.name),
      },
      ...tokens,
    };
  }
}
