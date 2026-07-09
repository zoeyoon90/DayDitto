import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class TranslateService {
  private readonly client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async translate(lines: string[]): Promise<string[]> {
    const nonEmpty = lines.filter((l) => l.trim());
    if (!nonEmpty.length) return lines.map(() => '');

    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Translate each Korean diary sentence to natural English. Return ONLY a JSON array of translated strings in the same order. Do not add explanations.

Korean sentences:
${nonEmpty.map((l, i) => `${i + 1}. ${l}`).join('\n')}`,
        },
      ],
    });

    const text = (message.content[0] as { text: string }).text;
    const translations: string[] = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] ?? '[]');

    let idx = 0;
    return lines.map((l) => (l.trim() ? (translations[idx++] ?? '') : ''));
  }
}
