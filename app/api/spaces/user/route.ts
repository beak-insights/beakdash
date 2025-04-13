import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { spaces, userSpaces, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all spaces that the current user is a member of
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find current user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email || ''),
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all spaces where the user is a member
    const userMemberships = await db.query.userSpaces.findMany({
      where: eq(userSpaces.userId, user.id),
      with: {
        space: true,
      },
    });
    
    // Extract just the spaces from the memberships
    const userSpacesData = userMemberships.map(membership => ({
      ...membership.space,
      role: membership.role,
    }));
    
    return NextResponse.json(userSpacesData);
  } catch (error) {
    console.error('Error fetching user spaces:', error);
    return NextResponse.json({ error: 'Failed to fetch user spaces' }, { status: 500 });
  }
}