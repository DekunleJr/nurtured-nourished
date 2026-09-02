import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify`, {
    credentials: 'include',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  const result = new NextResponse(JSON.stringify(data), { status: response.status });
  result.headers.set('Content-Type', 'application/json');
  return result;
}