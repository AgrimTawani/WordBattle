import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received challenge request:', {
      challengerId: body.userId,
      challengedId: body.friendId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in challenge route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 


