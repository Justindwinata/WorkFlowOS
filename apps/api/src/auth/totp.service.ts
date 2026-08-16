import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TotpService {
  generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `WorkFlowOS (${userEmail})`,
      length: 20,
    });
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || `otpauth://totp/WorkFlowOS:${userEmail}?secret=${secret.base32}&issuer=WorkFlowOS`,
    };
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}