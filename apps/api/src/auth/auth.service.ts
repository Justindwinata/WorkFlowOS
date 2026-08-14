import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt.interface';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      workspaceId: user.workspaceId,
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

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
      const tokens = await this.tokenService.generateTokenPair(payload);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
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
      permissions: (user.role.permissions as any).map((p: any) => p.name),
    };
  }
}
