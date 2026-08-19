import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { permissions: true } } },
    });

    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedException('User tidak ditemukan atau tidak aktif');
    }

    if (payload.version !== undefined && payload.version !== user.tokenVersion) {
      throw new UnauthorizedException('Sesi telah di-revoke');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      workspaceId: user.workspaceId,
      permissions: (user.role.permissions as any).map((p: any) => p.name),
    };
  }
}
