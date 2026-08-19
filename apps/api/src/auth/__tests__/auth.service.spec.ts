import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { AccountSecurityService } from '../account-security.service';
import { TotpService } from '../totp.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userWorkspace: {
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    workspace: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockTotpService = {
    generateSecret: jest.fn().mockReturnValue({ secret: 'SECRET', otpauthUrl: 'url' }),
    generateQrCode: jest.fn().mockResolvedValue('qr-code'),
    verifyToken: jest.fn().mockReturnValue(true),
  };

  const setTotpValid = (valid: boolean) => {
    (mockTotpService.verifyToken as jest.Mock).mockReturnValue(valid);
  };

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret' }),
      ],
      providers: [
        AuthService,
        TokenService,
        AccountSecurityService,
        { provide: TotpService, useValue: mockTotpService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);

    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.role.findUnique.mockReset();
    mockPrisma.role.create.mockReset();
    mockPrisma.workspace.findFirst.mockReset();
    mockPrisma.workspace.create.mockReset();
    mockPrisma.userWorkspace.create.mockReset();
    (mockTotpService.verifyToken as jest.Mock).mockReset();
    (mockTotpService.verifyToken as jest.Mock).mockReturnValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register', () => {
    it('should throw ConflictException if user exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@test.com',
          username: 'test',
          password: 'password123',
        }),
      ).rejects.toThrow('Email atau username sudah terdaftar');
    });

    it('should create user with hashed password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.workspace.findFirst.mockResolvedValue({ id: 'ws-1' });
      mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'member' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'test',
        firstName: null,
        lastName: null,
        role: { id: 'role-1', name: 'member', permissions: [{ name: 'read' }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({
        email: 'test@test.com',
        username: 'test',
        password: 'password123',
      });

      expect(result.user.id).toBe('user-1');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            username: 'test',
          }),
        }),
      );
    });
  });

  describe('Login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow('Email atau password salah');
    });

    it('should return tokens on successful login without 2FA', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'test',
        password: await bcrypt.hash('password123', 10),
        firstName: null,
        lastName: null,
        role: { id: 'role-1', name: 'member', permissions: [{ name: 'read' }] },
        tokenVersion: 0,
        workspaceId: 'ws-1',
        totpSecret: null,
      });

      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect((result as any).accessToken).toBeDefined();
      expect((result as any).refreshToken).toBeDefined();
      expect((result as any).user).toBeDefined();
      expect((result as any).requires2FA).toBeUndefined();
    });

    it('should return requires2FA when user has TOTP enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'test',
        password: await bcrypt.hash('password123', 10),
        firstName: null,
        lastName: null,
        role: { id: 'role-1', name: 'member', permissions: [{ name: 'read' }] },
        tokenVersion: 0,
        workspaceId: 'ws-1',
        totpSecret: 'SECRET',
      });

      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect((result as any).requires2FA).toBe(true);
      expect((result as any).userId).toBe('user-1');
      expect((result as any).email).toBe('test@test.com');
      expect((result as any).accessToken).toBeUndefined();
      expect((result as any).refreshToken).toBeUndefined();
    });
  });

  describe('TokenService', () => {
    it('should generate access and refresh tokens', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        username: 'test',
        roleId: 'role-1',
        workspaceId: 'ws-1',
      };

      const tokens = await tokenService.generateTokenPair(payload);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('Refresh Token', () => {
    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.refresh('invalid'),
      ).rejects.toThrow('Refresh token tidak valid');
    });

    it('should reject refresh token after sessions revoked (tokenVersion changed)', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        username: 'test',
        roleId: 'role-1',
        workspaceId: 'ws-1',
        version: 1,
      };
      const { refreshToken } = await tokenService.generateTokenPair(payload);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: 'active',
        deletedAt: null,
        tokenVersion: 2, // bumped by logout/change-password
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Refresh token telah di-revoke',
      );
    });

    it('should reject refresh token for deleted user', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        username: 'test',
        roleId: 'role-1',
        workspaceId: 'ws-1',
        version: 1,
      };
      const { refreshToken } = await tokenService.generateTokenPair(payload);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: 'active',
        deletedAt: new Date(),
        tokenVersion: 1,
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Refresh token tidak valid',
      );
    });
  });

  describe('Logout', () => {
    it('should revoke user sessions', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', tokenVersion: 2 });

      const result = await service.revokeUserSessions('user-1');
      expect(result.message).toBe('Sesi berhasil direvoke');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { tokenVersion: { increment: 1 } },
        select: { id: true, tokenVersion: true },
      });
    });
  });

  describe('Change Password', () => {
    it('should change password and revoke sessions', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: await bcrypt.hash('currentPass123', 10),
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1' });

      await expect(
        service.changePassword('user-1', 'currentPass123', 'newPass123!'),
      ).resolves.toEqual({ message: 'Password berhasil diubah, semua sesi direvoke' });
    });

    it('should throw UnauthorizedException for invalid current password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: await bcrypt.hash('currentPass123', 10),
      });

      await expect(
        service.changePassword('user-1', 'wrongPass', 'newPass123!'),
      ).rejects.toThrow('Password saat ini salah');
    });
  });

  describe('2FA', () => {
    it('should generate secret and QR code for 2FA setup', async () => {
      const result = await service.setup2FA('user-1', 'test@test.com');
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result.message).toContain('QR code');
    });

    it('should enable 2FA with valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totpSecret: 'SECRET',
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', tokenVersion: 1 });

      const result = await service.enable2FA('user-1', '123456');
      expect(result.message).toBe('2FA berhasil diaktifkan');
      expect(result.twoFactorEnabled).toBe(true);
    });

    it('should throw UnauthorizedException if 2FA not set up', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', totpSecret: null });

      await expect(service.enable2FA('user-1', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totpSecret: 'SECRET',
      });
      setTotpValid(false);

      await expect(service.enable2FA('user-1', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should disable 2FA with valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totpSecret: 'SECRET',
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', tokenVersion: 1 });

      const result = await service.disable2FA('user-1', '123456');
      expect(result.message).toBe('2FA berhasil dinonaktifkan');
      expect(result.twoFactorEnabled).toBe(false);
    });

    it('should throw UnauthorizedException for invalid disable token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totpSecret: 'SECRET',
      });
      setTotpValid(false);

      await expect(service.disable2FA('user-1', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if 2FA login verification called but 2FA not enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: 'active',
        totpSecret: null,
      });

      await expect(service.verify2FALogin('user-1', '123456')).rejects.toThrow(
        'TOTP belum diaktifkan',
      );
    });
  });
});