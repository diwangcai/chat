import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      fakeAI: process.env.FAKE_AI === '1',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      e2eMode: process.env.NEXT_PUBLIC_E2E === '1',
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
