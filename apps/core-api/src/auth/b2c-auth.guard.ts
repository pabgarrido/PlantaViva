import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class B2CAuthGuard implements CanActivate {
  private jwksClient: jwksRsa.JwksClient;

  constructor() {
    const tenant = process.env['AZURE_B2C_TENANT'] ?? '';
    const policy = process.env['AZURE_B2C_POLICY'] ?? 'B2C_1_signup_signin';
    this.jwksClient = jwksRsa({
      jwksUri: `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/discovery/v2.0/keys`,
      cache: true,
      cacheMaxAge: 600000,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      const audience = process.env['AZURE_B2C_CLIENT_ID'] ?? '';
      const tenant = process.env['AZURE_B2C_TENANT'] ?? '';
      const policy = process.env['AZURE_B2C_POLICY'] ?? 'B2C_1_signup_signin';
      const issuer = `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/v2.0/`;

      const payload = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        audience,
        issuer,
      });

      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
