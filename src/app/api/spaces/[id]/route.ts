import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Forward request to existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/spaces/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch space' },
        { status: response.status }
      );
    }
    
    const space = await response.json();
    return NextResponse.json(space);
  } catch (error) {
    console.error(`Space fetch error for ID ${params.id}:`, error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Forward request to existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/spaces/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to update space' },
        { status: response.status }
      );
    }
    
    const space = await response.json();
    return NextResponse.json(space);
  } catch (error) {
    console.error(`Space update error for ID ${params.id}:`, error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Forward request to existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/spaces/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to delete space' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error(`Space deletion error for ID ${params.id}:`, error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}