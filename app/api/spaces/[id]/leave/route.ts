import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, userSpaces, spaces } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Leave a space as the current user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceId = parseInt(params.id);
    
    if (isNaN(spaceId)) {
      return NextResponse.json({ error: 'Invalid space ID' }, { status: 400 });
    }
    
    // Find current user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email || ''),
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if space exists
    const space = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Check if user is a member of the space
    const membership = await db.query.userSpaces.findFirst({
      where: and(
        eq(userSpaces.userId, user.id),
        eq(userSpaces.spaceId, spaceId)
      ),
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this space' }, { status: 400 });
    }
    
    // Prevent owner from leaving their own space
    if (membership.role === 'owner') {
      return NextResponse.json({ 
        error: 'Space owner cannot leave. Transfer ownership or delete the space instead.' 
      }, { status: 400 });
    }
    
    // Remove user from space
    await db.delete(userSpaces).where(
      and(
        eq(userSpaces.userId, user.id),
        eq(userSpaces.spaceId, spaceId)
      )
    );
    
    // Redirect to spaces list
    return NextResponse.redirect(new URL('/spaces', request.url));
    
  } catch (error) {
    console.error('Error leaving space:', error);
    return NextResponse.json({ error: 'Failed to leave space' }, { status: 500 });
  }
}