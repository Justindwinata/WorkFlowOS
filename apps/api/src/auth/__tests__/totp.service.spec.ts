import { Test, TestingModule } from '@nestjs/testing';
import { TotpService } from '../totp.service';

describe('TOTP Service - Regression Tests', () => {
  let service: TotpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TotpService],
    }).compile();

    service = module.get<TotpService>(TotpService);
  });

  describe('Secret Generation', () => {
    it('generates unique secrets on each call', () => {
      const secret1 = service.generateSecret('user1@test.com');
      const secret2 = service.generateSecret('user1@test.com');
      expect(secret1.secret).not.toBe(secret2.secret);
    });

    it('generates base32 encoded secrets', () => {
      const { secret } = service.generateSecret('user@test.com');
      const base32Regex = /^[A-Z2-7]+=*$/;
      expect(base32Regex.test(secret)).toBe(true);
    });

    it('secret length is at least 16 characters', () => {
      const { secret } = service.generateSecret('user@test.com');
      expect(secret.length).toBeGreaterThanOrEqual(16);
    });

    it('generates otpauth URL with email', () => {
      const email = 'test@example.com';
      const { otpauthUrl } = service.generateSecret(email);
      expect(otpauthUrl).toContain('otpauth://totp/');
      expect(otpauthUrl).toContain('test%40example.com'); // URL-encoded @
      expect(otpauthUrl).toContain('WorkFlowOS');
    });
  });

  describe('QR Code Generation', () => {
    it('generates valid data URL QR code', async () => {
      const { otpauthUrl } = service.generateSecret('user@test.com');
      const qrCode = await service.generateQrCode(otpauthUrl);
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('generates different QR codes for different URLs', async () => {
      const url1 = (await service.generateSecret('user1@test.com')).otpauthUrl;
      const url2 = (await service.generateSecret('user2@test.com')).otpauthUrl;
      const qr1 = await service.generateQrCode(url1);
      const qr2 = await service.generateQrCode(url2);
      expect(qr1).not.toBe(qr2);
    });
  });

  describe('Token Verification', () => {
    it('rejects invalid token format', () => {
      const secret = service.generateSecret('user@test.com').secret;
      expect(service.verifyToken(secret, 'invalid')).toBe(false);
      expect(service.verifyToken(secret, '12345')).toBe(false);
      expect(service.verifyToken(secret, 'abcdef')).toBe(false);
    });

    it('rejects empty or null tokens', () => {
      const secret = service.generateSecret('user@test.com').secret;
      expect(service.verifyToken(secret, '')).toBe(false);
      expect(service.verifyToken(secret, 'null')).toBe(false);
    });

    it('rejects tokens with wrong length', () => {
      const secret = service.generateSecret('user@test.com').secret;
      expect(service.verifyToken(secret, '12345')).toBe(false); // 5 digits
      expect(service.verifyToken(secret, '1234567')).toBe(false); // 7 digits
    });

    it('rejects tokens with non-numeric characters', () => {
      const secret = service.generateSecret('user@test.com').secret;
      expect(service.verifyToken(secret, '12345a')).toBe(false);
      expect(service.verifyToken(secret, '123 456')).toBe(false);
      expect(service.verifyToken(secret, '123-456')).toBe(false);
    });
  });

  describe('Security Properties', () => {
    it('does not expose secret in error messages', () => {
      const secret = service.generateSecret('user@test.com').secret;
      try {
        service.verifyToken(secret, '000000');
      } catch (e) {
        expect(String(e)).not.toContain(secret);
      }
    });

    it('uses sufficient entropy for secret generation', () => {
      const secrets = new Set();
      for (let i = 0; i < 100; i++) {
        const { secret } = service.generateSecret(`user${i}@test.com`);
        secrets.add(secret);
      }
      expect(secrets.size).toBe(100); // All unique
    });
  });
});
