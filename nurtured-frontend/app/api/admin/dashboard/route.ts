import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
    credentials: 'include',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}