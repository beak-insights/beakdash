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
    
    if (!existingMembership) {
      return NextResponse.json({ error: 'User is not a member of this space' }, { status: 400 });
    }
    
    // Check if user is the owner and the only one in the space
    if (existingMembership.role === 'owner') {
      const spaceMembers = await db.query.userSpaces.findMany({
        where: eq(userSpaces.spaceId, spaceId),
      });
      
      if (spaceMembers.length === 1) {
        return NextResponse.json({ 
          error: 'Cannot leave space as you are the only owner. Delete the space instead.' 
        }, { status: 400 });
      }
      
      // Check if there's another owner
      const otherOwners = spaceMembers.filter(member => 
        member.userId !== user.id && member.role === 'owner'
      );
      
      if (otherOwners.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot leave space as you are the only owner. Transfer ownership to another member first.' 
        }, { status: 400 });
      }
    }
    
    // Remove user from space
    await db.delete(userSpaces)
      .where(
        and(
          eq(userSpaces.userId, user.id),
          eq(userSpaces.spaceId, spaceId)
        )
      );
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully left space' 
    });
  } catch (error) {
    console.error('Error leaving space:', error);
    return NextResponse.json({ error: 'Failed to leave space' }, { status: 500 });
  }
}