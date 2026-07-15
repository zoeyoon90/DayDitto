import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { NoticesService } from '../notices/notices.service';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly noticesService: NoticesService,
  ) {}

  @Get('me')
  getMe(@Req() req: Request & { user: { role: string; email: string } }) {
    return { role: req.user.role, email: req.user.email };
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('inquiries')
  getInquiries() {
    return this.adminService.getInquiries();
  }

  @Get('inquiries/:id')
  getInquiry(@Param('id') id: string) {
    return this.adminService.getInquiry(id);
  }

  @Patch('inquiries/:id/reply')
  replyToInquiry(
    @Param('id') id: string,
    @Body('adminReply') adminReply: string,
  ) {
    return this.adminService.replyToInquiry(id, adminReply);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('stats/trend')
  getStatsTrend() {
    return this.adminService.getStatsTrend();
  }

  @Post('notices')
  createNotice(@Body('content') content: string) {
    return this.noticesService.create(content);
  }

  @Get('notices')
  getNotices() {
    return this.noticesService.getAll();
  }

  @Patch('notices/:id/deactivate')
  deactivateNotice(@Param('id') id: string) {
    return this.noticesService.deactivate(id);
  }

  @Post('notices/:id/resend')
  resendNotice(@Param('id') id: string) {
    return this.noticesService.resend(id);
  }

  @Get('push-notifications/stats')
  getPushNotificationStats() {
    return this.adminService.getPushNotificationStats();
  }
}
