import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { cookies } from 'next/headers';

// For production, this would use a proper session management system
// For this conversion, we're assuming an existing backend with auth endpoints

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the login request to the existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    // Set the authentication cookie
    // This assumes the backend provides a token
    if (data.token) {
      cookies().set({
        name: 'authToken',
        value: data.token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    return NextResponse.json(data.user || data);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}