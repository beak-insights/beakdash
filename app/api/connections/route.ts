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
        .where(eq(connections.userId, typeof userId === 'string' ? parseInt(userId) : userId));
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
    
    // Create connection configuration from the body
    const config = {
      type: body.type || 'sql',
      hostname: body.hostname,
      port: body.port,
      database: body.database,
      username: body.username,
      // Don't store password directly in DB in production
      // This is just for demo purposes
      password: body.password ? '********' : undefined,
      sslMode: body.sslMode,
      baseUrl: body.baseUrl,
      authType: body.authType,
      apiKey: body.apiKey ? '********' : undefined, // For REST APIs
      headerName: body.headerName,
      delimiter: body.delimiter, // For CSV
      encoding: body.encoding,
      hasHeaderRow: body.hasHeaderRow
    };
    
    // Create new connection
    const result = await db.insert(connections).values({
      name: body.name,
      type: body.type || 'sql',
      userId: typeof userId === 'string' ? parseInt(userId) : userId,
      spaceId: body.spaceId ? parseInt(body.spaceId) : null,
      config: config,
    });
    
    // Get inserted connection ID
    const insertedConnection = await db.select().from(connections)
      .where(eq(connections.name, body.name))
      .limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Connection created successfully',
      connection: insertedConnection[0]
    });
  } catch (error) {
    console.error('Connection creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}