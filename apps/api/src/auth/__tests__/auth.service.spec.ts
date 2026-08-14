import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret' }),
      ],
      providers: [
        AuthService,
        TokenService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);

    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    mockPrisma.role.findUnique.mockReset();
    mockPrisma.role.create.mockReset();
    mockPrisma.workspace.findFirst.mockReset();
    mockPrisma.workspace.create.mockReset();
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
});
