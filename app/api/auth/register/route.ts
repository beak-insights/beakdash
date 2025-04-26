import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { z } from 'zod';

// Registration validation schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Registration request received');
    
    // Parse request body
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    // Validate registration data
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', validation.error.format());
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
      console.log('Username already exists:', username);
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
        console.log('Email already exists:', email);
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // Create new user
    console.log('Attempting to create user in database');
    const insertResult = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      displayName: username,
    }).returning();
    
    console.log('User created successfully:', { id: insertResult[0].id, username: insertResult[0].username });
    
    const newUser = insertResult[0];
    
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