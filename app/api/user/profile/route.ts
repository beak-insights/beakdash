import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user profile
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get user stats
    const [dashboards, connections, datasets] = await Promise.all([
      db.query.dashboards.findMany({
        where: eq(users.id, session.user.id),
      }),
      db.query.connections.findMany({
        where: eq(users.id, session.user.id),
      }),
      db.query.datasets.findMany({
        where: eq(users.id, session.user.id),
      }),
    ]);

    return NextResponse.json({
      username: user.name,
      email: user.email,
      bio: user.bio || '',
      createdAt: user.createdAt,
      stats: {
        dashboards: dashboards.length,
        connections: connections.length,
        datasets: datasets.length,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { displayName, bio } = body;

    if (!displayName) {
      return new NextResponse('Display name is required', { status: 400 });
    }

    // Update user profile
    await db
      .update(users)
      .set({
        displayName,
        bio: bio || null,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 