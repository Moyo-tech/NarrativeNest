import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'not set';

  try {
    // Try to fetch from backend
    const response = await fetch(`${backendUrl}/healthz`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      backendUrl,
      backendStatus: response.status,
      backendResponse: data,
      message: 'Backend connection successful!'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      backendUrl,
      error: error.message,
      message: 'Failed to connect to backend'
    }, { status: 500 });
  }
}
