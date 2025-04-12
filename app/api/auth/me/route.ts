import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define the GET function with explicit typing
export async function GET(
  request: NextRequest,
  context: { params: {} }
) {
  try {
    // Get the auth token from cookies - await in Next.js 15
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Forward the request to the existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      // If the backend says the token is invalid, clear it from cookies
      if (response.status === 401) {
        const cookieStore = await cookies();
        cookieStore.delete('authToken');
      }
      
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Auth check error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}