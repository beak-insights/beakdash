import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // Build query string
    let queryString = '';
    if (userId) queryString += `userId=${userId}&`;
    
    // Forward request to existing backend
    const url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/spaces${queryString ? `?${queryString.slice(0, -1)}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch spaces' },
        { status: response.status }
      );
    }
    
    const spaces = await response.json();
    return NextResponse.json(spaces);
  } catch (error) {
    console.error('Spaces fetch error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication token
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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/spaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to create space' },
        { status: response.status }
      );
    }
    
    const space = await response.json();
    return NextResponse.json(space);
  } catch (error) {
    console.error('Space creation error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}