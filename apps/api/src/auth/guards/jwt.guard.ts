import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly jwksClient: jwksClient.JwksClient;

  constructor(configService: ConfigService) {
    this.jwksClient = jwksClient({
      jwksUri: `${configService.get<string>('SUPABASE_URL')}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') throw new Error();

      const signingKey = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = signingKey.getPublicKey();

      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        audience: 'authenticated',
      }) as jwt.JwtPayload;

      (request as Request & { user: unknown }).user = {
        id: payload.sub,
        email: payload['email'],
        nickname: payload['user_metadata']?.nickname,
      };

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token ?? null : null;
  }
}
