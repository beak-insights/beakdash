import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { connections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');
    
    // Query connections based on filters
    let connectionData;
    
    if (spaceId) {
      connectionData = await db.select().from(connections)
        .where(eq(connections.spaceId, parseInt(spaceId)));
    } else {
      // By default, get connections accessible to the user
      connectionData = await db.select().from(connections)
        .where(eq(connections.userId, parseInt(userId)));
    }
    
    return NextResponse.json(connectionData);
  } catch (error) {
    console.error('Connections fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Connection name is required' },
        { status: 400 }
      );
    }
    
    // Create new connection
    const newConnection = {
      name: body.name,
      type: body.type || 'sql',
      userId: userId,
      spaceId: body.spaceId || null,
      config: body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.insert(connections).values(newConnection);
    
    return NextResponse.json({
      success: true,
      message: 'Connection created successfully',
      connectionId: result.insertId
    });
  } catch (error) {
    console.error('Connection creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}