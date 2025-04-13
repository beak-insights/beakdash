import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { z } from 'zod';

// Registration validation schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate registration data
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid registration data', errors: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { username, email, password } = validation.data;
    
    // Check if username already exists
    const existingUserByUsername = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Check if email already exists (if email is used)
    if (email) {
      const existingUserByEmail = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });
      
      if (existingUserByEmail) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const result = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      displayName: username,
    }).returning();
    
    const newUser = result[0];
    
    // Return the user data without password
    return NextResponse.json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}