import { sql } from 'drizzle-orm';
import { db } from './index';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

/**
 * Applies all Drizzle migrations to the database
 */
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Check if users table exists by querying for the table
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    const usersTableExists = tableExists[0]?.exists === true;
    
    if (!usersTableExists) {
      console.log('Creating users table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT,
          avatar_url TEXT,
          email TEXT,
          theme TEXT DEFAULT 'light',
          language TEXT DEFAULT 'en',
          time_zone TEXT,
          settings JSONB DEFAULT '{}',
          role TEXT DEFAULT 'user',
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Create initial admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(schema.users).values({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        displayName: 'Administrator',
        role: 'admin',
      }).onConflictDoNothing();
      
      // Create initial test user
      const userPassword = await bcrypt.hash('password', 10);
      await db.insert(schema.users).values({
        username: 'user',
        password: userPassword,
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
      }).onConflictDoNothing();
      
      console.log('Created initial users');
    }
    
    // Create other tables as needed
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}