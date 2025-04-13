import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { spaces, userSpaces, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

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
    
    // Validate space exists
    const space = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Find the current user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email || ''),
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is already a member
    const existingMembership = await db.query.userSpaces.findFirst({
      where: and(
        eq(userSpaces.userId, user.id),
        eq(userSpaces.spaceId, spaceId)
      ),
    });
    
    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this space' }, { status: 400 });
    }
    
    // Add user to space
    const role = space.isPrivate ? 'pending' : 'member'; // If private, set as pending for approval
    
    await db.insert(userSpaces).values({
      userId: user.id,
      spaceId,
      role,
      joinedAt: new Date(),
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: space.isPrivate 
        ? 'Request to join space has been submitted' 
        : 'Successfully joined space' 
    });
  } catch (error) {
    console.error('Error joining space:', error);
    return NextResponse.json({ error: 'Failed to join space' }, { status: 500 });
  }
}