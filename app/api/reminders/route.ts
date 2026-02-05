import { NextResponse } from 'next/server';

// Phase 2: schedule reminder emails via cron.
export async function POST() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
