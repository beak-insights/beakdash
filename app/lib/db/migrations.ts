import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { migrateAlertsTables } from "./migrate-alerts";

/**
 * Initialize the database schema and run any necessary migrations
 */
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Check if the schema exists
    const schemaCheck = await checkIfSchemaExists();
    
    if (!schemaCheck) {
      console.log('Creating database schema...');
      await createSchema();
    } else {
      console.log('Database schema already exists, skipping creation');
    }
    
    // Check if spaces table needs migration
    console.log('Checking if spaces table needs migration...');
    await migrateSpacesTable();
    
    // Check if DB QA tables exist and create them if they don't
    console.log('Checking if DB QA tables exist...');
    await createDbQaTables();
    
    // Check if DB QA alert tables need to be updated
    console.log('Checking if DB QA alert tables need to be updated...');
    await migrateAlertsTables();
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Check if the schema exists by looking for any tables
 */
async function checkIfSchemaExists() {
  try {
    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    
    // Handle DrizzleORM result which uses array format in Next.js 15
    const rows = result as unknown as Array<{ exists: boolean }>;
    return rows.length > 0 && rows[0].exists;
  } catch (error) {
    console.error('Error checking schema:', error);
    return false;
  }
}

/**
 * Create all database tables
 */
async function createSchema() {
  try {
    // Create users table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create spaces table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spaces (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        slug TEXT NOT NULL,
        logo_url TEXT,
        settings JSONB DEFAULT '{}',
        is_private BOOLEAN DEFAULT FALSE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_spaces join table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_spaces (
        user_id INTEGER NOT NULL REFERENCES users(id),
        space_id INTEGER NOT NULL REFERENCES spaces(id),
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, space_id)
      );
    `);
    
    // Create dashboards table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        space_id INTEGER REFERENCES spaces(id),
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        layout JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create connections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        space_id INTEGER REFERENCES spaces(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create datasets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS datasets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        connection_id INTEGER REFERENCES connections(id),
        name TEXT NOT NULL,
        query TEXT,
        refresh_interval TEXT DEFAULT 'manual',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create widgets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS widgets (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES datasets(id),
        connection_id INTEGER REFERENCES connections(id),
        space_id INTEGER REFERENCES spaces(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config JSONB DEFAULT '{}',
        custom_query TEXT,
        is_template BOOLEAN DEFAULT FALSE,
        source_widget_id INTEGER REFERENCES widgets(id),
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create dashboard_widgets join table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
        widget_id INTEGER NOT NULL REFERENCES widgets(id),
        position JSONB DEFAULT '{}',
        PRIMARY KEY (dashboard_id, widget_id)
      );
    `);
    
    // Create DB QA tables
    await createDbQaTables();
    
    return true;
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

/**
 * Migrate spaces table structure if needed
 */
async function migrateSpacesTable() {
  try {
    // Check if is_default column exists
    const columnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'spaces'
        AND column_name = 'is_default'
      );
    `);
    
    // Handle DrizzleORM result
    const rows = columnCheck as unknown as Array<{ exists: boolean }>;
    const hasDefaultColumn = rows.length > 0 && rows[0].exists;
    
    if (!hasDefaultColumn) {
      console.log('Adding is_default column to spaces table...');
      await db.execute(sql`
        ALTER TABLE spaces
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
      `);
    } else {
      console.log('is_default column already exists, skipping this step');
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating spaces table:', error);
    throw error;
  }
}

/**
 * Create all DB QA related tables if they don't exist
 */
async function createDbQaTables() {
  try {
    // Check if db_qa_queries table exists
    const tableCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'db_qa_queries'
      );
    `);
    
    // Handle DrizzleORM result
    const rows = tableCheck as unknown as Array<{ exists: boolean }>;
    const hasDbQaTables = rows.length > 0 && rows[0].exists;
    
    if (!hasDbQaTables) {
      console.log('Creating DB QA tables...');
      
      // Create db_qa_queries table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_queries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          connection_id INTEGER NOT NULL REFERENCES connections(id),
          space_id INTEGER REFERENCES spaces(id),
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          query TEXT NOT NULL,
          expected_result JSONB DEFAULT '{}',
          thresholds JSONB DEFAULT '{}',
          enabled BOOLEAN DEFAULT TRUE,
          execution_frequency TEXT DEFAULT 'manual',
          last_execution_time TIMESTAMP,
          next_execution_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create db_qa_execution_results table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_execution_results (
          id SERIAL PRIMARY KEY,
          query_id INTEGER NOT NULL REFERENCES db_qa_queries(id),
          execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL,
          result JSONB DEFAULT '{}',
          metrics JSONB DEFAULT '{}',
          execution_duration INTEGER,
          error_message TEXT
        );
      `);
      
      // Create db_qa_alerts table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          query_id INTEGER NOT NULL REFERENCES db_qa_queries(id),
          execution_result_id INTEGER REFERENCES db_qa_execution_results(id),
          name TEXT NOT NULL,
          condition JSONB NOT NULL,
          status TEXT NOT NULL,
          notification_channels JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP
        );
      `);
      
      // Create db_qa_alert_notifications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_alert_notifications (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL REFERENCES db_qa_alerts(id),
          channel TEXT NOT NULL,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL,
          content JSONB DEFAULT '{}',
          error_message TEXT
        );
      `);
      
      // Create db_qa_dashboards table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_dashboards (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          space_id INTEGER REFERENCES spaces(id),
          name TEXT NOT NULL,
          description TEXT,
          layout JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('DB QA tables created successfully');
    } else {
      console.log('DB QA tables already exist, skipping creation');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating DB QA tables:', error);
    throw error;
  }
}