import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { logId, lineIndex, text } = (await request.json()) as {
    logId: string
    lineIndex: number
    text: string
  }
  if (!logId || lineIndex == null || !text?.trim()) {
    return Response.json({ error: 'logId, lineIndex, and text required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) return Response.json({ error: 'GOOGLE_TTS_API_KEY not set' }, { status: 500 })

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
  if (!ttsRes.ok) {
    const err = await ttsRes.text()
    return Response.json({ error: `TTS API error: ${err}` }, { status: 500 })
  }

  const { audioContent } = (await ttsRes.json()) as { audioContent: string }
  const audioBuffer = Buffer.from(audioContent, 'base64')

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const storagePath = `${session.user.id}/${logId}/line-${lineIndex}.mp3`
  const { error: uploadError } = await adminSupabase.storage
    .from('diary-audio')
    .upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from('diary-audio').getPublicUrl(storagePath)

  // Fetch current log to merge lineAudioUrls
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  const logRes = await fetch(`${apiUrl}/daily-logs/${logId}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  const log = (await logRes.json()) as { lineAudioUrls: (string | null)[] | null }

  const updatedUrls = [...(log.lineAudioUrls ?? [])]
  updatedUrls[lineIndex] = publicUrl

  await fetch(`${apiUrl}/daily-logs/${logId}/line-audio`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ lineAudioUrls: updatedUrls }),
  })

  return Response.json({ audioUrl: publicUrl })
}
