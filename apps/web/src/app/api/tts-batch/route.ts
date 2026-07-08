import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { logId, lines } = (await request.json()) as { logId: string; lines: string[] }
  if (!logId || !lines?.length) {
    return Response.json({ error: 'logId and lines required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GOOGLE_TTS_API_KEY not set' }, { status: 500 })
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const lineAudioUrls = await Promise.all(
    lines.map(async (text, index) => {
      const ttsRes = await fetch(
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
      )
      if (!ttsRes.ok) throw new Error(`TTS failed for line ${index}`)
      const { audioContent } = (await ttsRes.json()) as { audioContent: string }
      const audioBuffer = Buffer.from(audioContent, 'base64')

      const storagePath = `${session.user.id}/${logId}/line-${index}.mp3`
      const { error } = await adminSupabase.storage
        .from('diary-audio')
        .upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
      if (error) throw new Error(`Storage upload failed for line ${index}: ${error.message}`)

      const {
        data: { publicUrl },
      } = adminSupabase.storage.from('diary-audio').getPublicUrl(storagePath)
      return publicUrl
    }),
  )

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  await fetch(`${apiUrl}/daily-logs/${logId}/line-audio`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ lineAudioUrls }),
  })

  return Response.json({ lineAudioUrls })
}
