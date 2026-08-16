import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, TokenPair } from './interfaces/jwt.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessSecret || accessSecret === 'default-secret') {
      this.logger.warn('JWT_ACCESS_SECRET is not set or is default - production security risk');
    }
    if (!refreshSecret || refreshSecret === 'default-refresh-secret') {
      this.logger.warn('JWT_REFRESH_SECRET is not set or is default - production security risk');
    }
  }

  async generateTokenPair(user: JwtPayload): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.getAccessSecret(),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.getRefreshSecret(),
    });
  }

  private getAccessSecret(): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      this.logger.error('JWT_ACCESS_SECRET not configured');
      throw new Error('JWT_ACCESS_SECRET not configured');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      this.logger.error('JWT_REFRESH_SECRET not configured');
      throw new Error('JWT_REFRESH_SECRET not configured');
    }
    return secret;
  }
}
