import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { lines } = (await request.json()) as { lines: string[] };

    const nonEmpty = lines.filter((l) => l.trim());
    if (!nonEmpty.length) {
      return Response.json({ translations: lines.map(() => '') });
    }

    const message = await client.messages.create({
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
    console.log('[translate] raw response:', text);
    const translations: string[] = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] ?? '[]');

    let idx = 0;
    const result = lines.map((l) => (l.trim() ? (translations[idx++] ?? '') : ''));
    return Response.json({ translations: result });
  } catch (e) {
    console.error('[translate] error:', e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
