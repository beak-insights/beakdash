import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = cookies().get('authToken')?.value;
    
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
        cookies().delete('authToken');
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