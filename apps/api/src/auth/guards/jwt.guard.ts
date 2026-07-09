import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;

  constructor(configService: ConfigService) {
    this.supabaseUrl = configService.get<string>('SUPABASE_URL')!;
    this.supabaseServiceKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    const adminSupabase = createClient(
      this.supabaseUrl,
      this.supabaseServiceKey,
    );
    const {
      data: { user },
      error,
    } = await adminSupabase.auth.getUser(token);

    if (error || !user) throw new UnauthorizedException();

    (request as Request & { user: unknown }).user = {
      id: user.id,
      email: user.email!,
      nickname: (user.user_metadata as { nickname?: string })?.nickname,
      provider:
        (user.app_metadata as { provider?: string })?.provider ?? 'email',
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? (token ?? null) : null;
  }
}
