import 'dotenv/config';
import pg from 'pg';

async function main() {
  console.log('Starting database migration to support dashboard_widgets...');
  
  // Connect to Neon database
  const sql_url = process.env.DATABASE_URL;
  if (!sql_url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  console.log('Connecting to database...');
  const client = new pg.Client({
    connectionString: sql_url,
  });
  
  await client.connect();
  
  try {
    console.log('Creating dashboard_widgets table if it does not exist...');
    
    // Create the dashboard_widgets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
        widget_id INTEGER NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
        position JSONB DEFAULT '{}' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (dashboard_id, widget_id)
      );
    `);
    
    console.log('Migrating existing widget data to dashboard_widgets table...');
    
    // Check if widgets table has dashboardId and position columns
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'widgets' 
      AND column_name IN ('dashboard_id', 'position');
    `);
    
    if (columns && columns.length > 0) {
      console.log('Found old columns, migrating data...');
      
      // Transfer data from widgets table to dashboard_widgets
      await client.query(`
        INSERT INTO dashboard_widgets (dashboard_id, widget_id, position)
        SELECT dashboard_id, id, position
        FROM widgets
        WHERE dashboard_id IS NOT NULL
        ON CONFLICT (dashboard_id, widget_id) DO NOTHING;
      `);
      
      console.log('Successfully migrated widget data to dashboard_widgets table.');
    } else {
      console.log('No old columns found, skipping data migration.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(console.error);