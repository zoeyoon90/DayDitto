import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
  provider: string;
}

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly configService: ConfigService) {}

  private getAdminClient() {
    return createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  @Get('me')
  getMe(@Req() req: Request & { user: AuthUser }) {
    const { id, email, nickname, provider } = req.user;
    return { id, email, nickname: nickname ?? null, provider };
  }

  @Patch('me')
  async updateMe(
    @Req() req: Request & { user: AuthUser },
    @Body() body: { nickname?: string },
  ) {
    const nickname = body.nickname?.trim();
    if (!nickname || nickname.length < 2) {
      throw new InternalServerErrorException('닉네임은 2자 이상이어야 합니다.');
    }

    const adminSupabase = this.getAdminClient();
    const { error } = await adminSupabase.auth.admin.updateUserById(req.user.id, {
      user_metadata: { nickname },
    });
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  @Delete('me')
  @HttpCode(200)
  async deleteMe(@Req() req: Request & { user: AuthUser }) {
    const adminSupabase = this.getAdminClient();
    const { error } = await adminSupabase.auth.admin.deleteUser(req.user.id);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }
}
