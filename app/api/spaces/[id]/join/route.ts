import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, userSpaces } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Join a space as the current user
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
    
    // Check if user is already a member of the space
    const existingMembership = await db.query.userSpaces.findFirst({
      where: and(
        eq(userSpaces.userId, user.id),
        eq(userSpaces.spaceId, spaceId)
      ),
    });
    
    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this space' }, { status: 400 });
    }
    
    // Add user to space with 'member' role
    await db.insert(userSpaces).values({
      userId: user.id,
      spaceId: spaceId,
      role: 'member',
      joinedAt: new Date(),
    });
    
    // Redirect to the space page
    return NextResponse.redirect(new URL(`/spaces/${spaceId}`, request.url));
    
  } catch (error) {
    console.error('Error joining space:', error);
    return NextResponse.json({ error: 'Failed to join space' }, { status: 500 });
  }
}