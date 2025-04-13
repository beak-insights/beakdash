import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { spaces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceId = parseInt(params.id);
    
    const space = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    return NextResponse.json(space);
  } catch (error) {
    console.error('Error fetching space:', error);
    return NextResponse.json({ error: 'Failed to fetch space' }, { status: 500 });
  }
}

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
    
    // Validate the space exists
    const existingSpace = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    const formData = await request.formData();
    const method = formData.get('_method') as string;
    
    // Handle PUT requests
    if (method === 'PUT') {
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const isDefault = formData.get('isDefault') === 'on';
      
      if (!name) {
        return NextResponse.json({ error: 'Space name is required' }, { status: 400 });
      }
      
      // If this space is to be the default, update all existing spaces to not be default
      if (isDefault && !existingSpace.isDefault) {
        await db.update(spaces)
          .set({ isDefault: false })
          .where(eq(spaces.isDefault, true));
      }
      
      // Update the space
      await db.update(spaces)
        .set({
          name,
          description,
          isDefault,
          updatedAt: new Date(),
        })
        .where(eq(spaces.id, spaceId));
      
      // Redirect back to the space detail page
      return NextResponse.redirect(new URL(`/spaces/${spaceId}`, request.url));
    }
    
    // Handle DELETE requests
    if (method === 'DELETE') {
      // Check if this is the default space
      if (existingSpace.isDefault) {
        // Cannot delete default space
        return NextResponse.json({ error: 'Cannot delete default space' }, { status: 400 });
      }
      
      // Delete the space
      await db.delete(spaces).where(eq(spaces.id, spaceId));
      
      // Redirect to spaces listing
      return NextResponse.redirect(new URL('/spaces', request.url));
    }
    
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error updating space:', error);
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceId = parseInt(params.id);
    
    // Validate the space exists
    const existingSpace = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    const data = await request.json();
    const { name, description, isDefault } = data;
    
    if (!name) {
      return NextResponse.json({ error: 'Space name is required' }, { status: 400 });
    }
    
    // If this space is to be the default, update all existing spaces to not be default
    if (isDefault && !existingSpace.isDefault) {
      await db.update(spaces)
        .set({ isDefault: false })
        .where(eq(spaces.isDefault, true));
    }
    
    // Update the space
    const [updatedSpace] = await db.update(spaces)
      .set({
        name,
        description,
        isDefault,
        updatedAt: new Date(),
      })
      .where(eq(spaces.id, spaceId))
      .returning();
    
    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error('Error updating space:', error);
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceId = parseInt(params.id);
    
    // Validate the space exists
    const existingSpace = await db.query.spaces.findFirst({
      where: eq(spaces.id, spaceId),
    });
    
    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Check if this is the default space
    if (existingSpace.isDefault) {
      // Cannot delete default space
      return NextResponse.json({ error: 'Cannot delete default space' }, { status: 400 });
    }
    
    // Delete the space
    await db.delete(spaces).where(eq(spaces.id, spaceId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting space:', error);
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 });
  }
}