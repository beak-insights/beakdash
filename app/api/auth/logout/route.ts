import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    
    // Forward the logout request to the existing backend for any session cleanup
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include any cookies for the backend
      credentials: 'include',
    });
    
    // Even if the backend request fails, we still want to clear local cookies
    if (!response.ok) {
      console.warn('Backend logout request failed, but local session was cleared');
    }
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we still want to clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    
    return NextResponse.json(
      { message: 'Logged out (with server error)' },
      { status: 500 }
    );
  }
}