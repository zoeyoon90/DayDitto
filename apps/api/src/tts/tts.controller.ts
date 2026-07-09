import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TtsService } from './tts.service';

interface AuthUser {
  id: string;
}

@Controller('tts')
@UseGuards(JwtGuard)
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('line')
  ttsLine(
    @Req() req: Request & { user: AuthUser },
    @Body() body: { logId: string; lineIndex: number; text: string },
  ) {
    return this.ttsService.ttsLine(
      req.user.id,
      body.logId,
      body.lineIndex,
      body.text,
    );
  }

  @Post('batch')
  ttsBatch(
    @Req() req: Request & { user: AuthUser },
    @Body() body: { logId: string; lines: string[] },
  ) {
    return this.ttsService.ttsBatch(req.user.id, body.logId, body.lines);
  }

  @Post('favorite')
  ttsFavorite(
    @Req() req: Request & { user: AuthUser },
    @Body() body: { favoriteId: string; text: string },
  ) {
    return this.ttsService.ttsFavorite(req.user.id, body.favoriteId, body.text);
  }
}
