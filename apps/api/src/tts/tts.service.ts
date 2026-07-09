import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { DailyLogsService } from '../daily-logs/daily-logs.service';
import { FavoriteExpressionsService } from '../favorite-expressions/favorite-expressions.service';

@Injectable()
export class TtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dailyLogsService: DailyLogsService,
    private readonly favoriteExpressionsService: FavoriteExpressionsService,
  ) {}

  private getAdminClient() {
    return createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  private async synthesize(text: string): Promise<Buffer> {
    const apiKey = this.configService.get<string>('GOOGLE_TTS_API_KEY');
    if (!apiKey)
      throw new InternalServerErrorException('GOOGLE_TTS_API_KEY not set');

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'en-US', name: 'en-US-Neural2-C' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      },
    );
    if (!res.ok)
      throw new InternalServerErrorException(
        `TTS API error: ${await res.text()}`,
      );
    const { audioContent } = (await res.json()) as { audioContent: string };
    return Buffer.from(audioContent, 'base64');
  }

  private async uploadAudio(path: string, audio: Buffer): Promise<string> {
    const adminSupabase = this.getAdminClient();
    const { error } = await adminSupabase.storage
      .from('diary-audio')
      .upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
    if (error) throw new InternalServerErrorException(error.message);
    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('diary-audio').getPublicUrl(path);
    return publicUrl;
  }

  async ttsLine(
    userId: string,
    logId: string,
    lineIndex: number,
    text: string,
  ) {
    const audio = await this.synthesize(text);
    const publicUrl = await this.uploadAudio(
      `${userId}/${logId}/line-${lineIndex}.mp3`,
      audio,
    );

    const log = await this.dailyLogsService.getLogById(userId, logId);
    const updatedUrls = [
      ...((log?.lineAudioUrls as (string | null)[] | null) ?? []),
    ];
    updatedUrls[lineIndex] = publicUrl;
    await this.dailyLogsService.updateLineAudioUrls(
      userId,
      logId,
      updatedUrls as string[],
    );

    return { audioUrl: publicUrl };
  }

  async ttsBatch(userId: string, logId: string, lines: string[]) {
    const lineAudioUrls = await Promise.all(
      lines.map(async (text, index) => {
        const audio = await this.synthesize(text);
        return this.uploadAudio(`${userId}/${logId}/line-${index}.mp3`, audio);
      }),
    );

    await this.dailyLogsService.updateLineAudioUrls(
      userId,
      logId,
      lineAudioUrls,
    );
    return { lineAudioUrls };
  }

  async ttsFavorite(userId: string, favoriteId: string, text: string) {
    const audio = await this.synthesize(text);
    const publicUrl = await this.uploadAudio(
      `${userId}/favorites/${favoriteId}.mp3`,
      audio,
    );

    await this.favoriteExpressionsService.updateAudioUrl(
      userId,
      favoriteId,
      publicUrl,
    );
    return { audioUrl: publicUrl };
  }
}
