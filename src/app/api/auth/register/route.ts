import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the registration request to the existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Registration failed' },
        { status: response.status }
      );
    }
    
    // Set the authentication cookie if applicable
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
    console.error('Registration error:', error);
    
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