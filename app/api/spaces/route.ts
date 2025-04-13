import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { spaces } from '@/lib/db/schema';
import { authOptions } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const allSpaces = await db.query.spaces.findMany({
      orderBy: (spaces, { asc }) => [asc(spaces.name)],
    });
    
    return NextResponse.json(allSpaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isDefault = formData.get('isDefault') === 'on';
    
    if (!name) {
      return NextResponse.json({ error: 'Space name is required' }, { status: 400 });
    }
    
    // If this space is to be the default, update all existing spaces to not be default
    if (isDefault) {
      await db.update(spaces)
        .set({ isDefault: false })
        .where(eq(spaces.isDefault, true));
    }
    
    // Insert the new space
    const [newSpace] = await db.insert(spaces)
      .values({
        name,
        description,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return NextResponse.redirect(new URL('/spaces', request.url));
  } catch (error) {
    console.error('Error creating space:', error);
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
  }
}