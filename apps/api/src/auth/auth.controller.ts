import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
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
  async tossLogin(@Body() body: { authorizationCode: string }) {
    return this.authService.loginWithTossAuthCode(body.authorizationCode);
  }

  @Post('toss/refresh')
  async tossRefresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTossToken(body.refreshToken);
  }
}
