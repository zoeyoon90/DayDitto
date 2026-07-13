import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DailyLogsService } from './daily-logs.service';
import { CreateLogDto } from './dto/create-log.dto';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
  provider: string;
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
      throw new BadRequestException(
        'year and month(1-12) query params required',
      );
    }

    return this.dailyLogsService.getMonthlyLogs(req.user.id, year, month);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getLog(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.dailyLogsService.getLogById(req.user.id, id);
  }

  @Patch(':id/audio')
  @UseGuards(JwtGuard)
  updateAudio(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
    @Body() body: { audioUrl: string },
  ) {
    return this.dailyLogsService.updateAudioUrl(req.user.id, id, body.audioUrl);
  }

  @Patch(':id/line-audio')
  @UseGuards(JwtGuard)
  updateLineAudio(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
    @Body() body: { lineAudioUrls: string[] },
  ) {
    return this.dailyLogsService.updateLineAudioUrls(
      req.user.id,
      id,
      body.lineAudioUrls,
    );
  }

  @Post()
  @UseGuards(JwtGuard)
  createLog(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateLogDto,
  ) {
    return this.dailyLogsService.createLog(req.user, dto);
  }
}
