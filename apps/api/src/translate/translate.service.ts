import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { aiUsageLogs } from '../db/schema';

@Injectable()
export class TranslateService {
  private readonly client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async translate(userId: string, lines: string[]): Promise<string[]> {
    const nonEmpty = lines.filter((l) => l.trim());
    if (!nonEmpty.length) return lines.map(() => '');

    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Detect the language of each sentence and translate it to the other language (Korean→English or English→Korean). Handle each line independently. Return ONLY a JSON array of translated strings in the same order. Do not add explanations.

Sentences:
${nonEmpty.map((l, i) => `${i + 1}. ${l}`).join('\n')}`,
        },
      ],
    });

    await db.insert(aiUsageLogs).values({
      userId,
      callType: 'translation',
      model: 'claude-haiku-4-5-20251001',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });

    const text = (message.content[0] as { text: string }).text;
    const translations = JSON.parse(
      text.match(/\[[\s\S]*\]/)?.[0] ?? '[]',
    ) as string[];

    let idx = 0;
    return lines.map((l) => (l.trim() ? (translations[idx++] ?? '') : ''));
  }
}
