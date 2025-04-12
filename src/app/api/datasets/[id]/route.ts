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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/datasets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch dataset' },
        { status: response.status }
      );
    }
    
    const dataset = await response.json();
    return NextResponse.json(dataset);
  } catch (error) {
    console.error(`Dataset fetch error for ID ${params.id}:`, error);
    
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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/datasets/${id}`, {
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
        { message: errorData.message || 'Failed to update dataset' },
        { status: response.status }
      );
    }
    
    const dataset = await response.json();
    return NextResponse.json(dataset);
  } catch (error) {
    console.error(`Dataset update error for ID ${params.id}:`, error);
    
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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/datasets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to delete dataset' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error(`Dataset deletion error for ID ${params.id}:`, error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}