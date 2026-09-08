import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt.guard';
import { AuthService } from './auth.service';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }

  @Post('toss')
  async tossLogin(
    @Body() body: { authorizationCode: string; referrer?: string },
  ) {
    if (!body.authorizationCode) {
      throw new BadRequestException('authorizationCode is required');
    }
    return this.authService.loginWithTossAuthCode(
      body.authorizationCode,
      body.referrer,
    );
  }

  @Post('toss/refresh')
  async tossRefresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }
    return this.authService.refreshTossToken(body.refreshToken);
  }
}
