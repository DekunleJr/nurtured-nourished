import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  const result = new NextResponse();
  result.cookies.set('admin-session', '', { maxAge: 0, path: '/' });
  return result;
}