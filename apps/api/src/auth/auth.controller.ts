import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt.guard';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
}

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }
}
