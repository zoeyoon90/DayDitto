import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const key = process.env.KLIPY_API_KEY;
  const base = `https://api.klipy.com/api/v1/${key}/gifs`;
  const url = q
    ? `${base}/search?q=${encodeURIComponent(q)}&per_page=24`
    : `${base}/trending?per_page=24`;

  const res = await fetch(url);
  const data = await res.json();
  return Response.json(data);
}
