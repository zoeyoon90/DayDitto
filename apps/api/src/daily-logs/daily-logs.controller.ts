import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DailyLogsService } from './daily-logs.service';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
}

@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get('monthly')
  @UseGuards(JwtGuard)
  getMonthly(
    @Req() req: Request & { user: AuthUser },
    @Query('year') yearStr: string,
    @Query('month') monthStr: string,
  ) {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    if (!year || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('year and month(1-12) query params required');
    }

    return this.dailyLogsService.getMonthlyLogs(req.user.id, year, month);
  }
}
