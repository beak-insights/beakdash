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
    
    // Create the schema for all tables if users table doesn't exist
    if (!usersTableExists) {
      console.log('Creating database schema...');
      
      // Create users table
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
      
      // Create spaces table
      console.log('Creating spaces table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS spaces (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          slug TEXT NOT NULL,
          logo_url TEXT,
          settings JSONB DEFAULT '{}',
          is_private BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create user_spaces join table
      console.log('Creating user_spaces table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_spaces (
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'member',
          joined_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (user_id, space_id)
        );
      `);

      // Create dashboards table
      console.log('Creating dashboards table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS dashboards (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          layout JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create connections table
      console.log('Creating connections table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS connections (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          config JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create datasets table
      console.log('Creating datasets table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS datasets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          query TEXT,
          refresh_interval TEXT DEFAULT 'manual',
          config JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create widgets table
      console.log('Creating widgets table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS widgets (
          id SERIAL PRIMARY KEY,
          dataset_id INTEGER REFERENCES datasets(id) ON DELETE SET NULL,
          connection_id INTEGER REFERENCES connections(id) ON DELETE SET NULL,
          space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          config JSONB DEFAULT '{}',
          custom_query TEXT,
          is_template BOOLEAN DEFAULT false,
          source_widget_id INTEGER REFERENCES widgets(id) ON DELETE SET NULL,
          is_global BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create dashboard_widgets join table
      console.log('Creating dashboard_widgets table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS dashboard_widgets (
          dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
          widget_id INTEGER NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
          position JSONB DEFAULT '{}',
          PRIMARY KEY (dashboard_id, widget_id)
        );
      `);
      
      // Create initial admin user
      console.log('Creating initial users...');
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
      
      // Create a default space
      console.log('Creating default space...');
      const spaceInsert = await db.insert(schema.spaces).values({
        name: 'Default Space',
        description: 'Default workspace for your dashboards',
        slug: 'default',
        isPrivate: false,
      }).returning();
      
      if (spaceInsert.length > 0) {
        const defaultSpace = spaceInsert[0];
        
        // Associate users with the default space
        const adminResult = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.username, 'admin')
        });
        
        const userResult = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.username, 'user')
        });
        
        if (adminResult) {
          await db.insert(schema.userSpaces).values({
            userId: adminResult.id,
            spaceId: defaultSpace.id,
            role: 'owner',
          }).onConflictDoNothing();
        }
        
        if (userResult) {
          await db.insert(schema.userSpaces).values({
            userId: userResult.id,
            spaceId: defaultSpace.id,
            role: 'member',
          }).onConflictDoNothing();
        }
        
        // Create a sample dashboard
        console.log('Creating sample dashboard...');
        if (adminResult) {
          const dashboardInsert = await db.insert(schema.dashboards).values({
            userId: adminResult.id,
            spaceId: defaultSpace.id,
            name: 'Welcome Dashboard',
            description: 'Getting started with BeakDash',
            isActive: true,
          }).returning();
          
          // We could add sample widgets here if needed
        }
      }
      
      console.log('Created initial data');
    } else {
      console.log('Database schema already exists, skipping creation');
    }
    
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}