import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Update DB QA alerts table with new fields
 */
export async function migrateAlertsTables() {
  try {
    console.log('Checking if db_qa_alerts table needs to be updated...');
    
    // Check if 'description' column exists
    const descColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'description'
      );
    `);
    
    // Handle DrizzleORM result
    const descRows = descColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasDescColumn = descRows.length > 0 && descRows[0].exists;
    
    if (!hasDescColumn) {
      console.log('Adding description column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN description TEXT;
      `);
    }
    
    // Check if 'severity' column exists
    const severityColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'severity'
      );
    `);
    
    // Handle DrizzleORM result
    const severityRows = severityColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasSeverityColumn = severityRows.length > 0 && severityRows[0].exists;
    
    if (!hasSeverityColumn) {
      console.log('Adding severity column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN severity TEXT NOT NULL DEFAULT 'medium';
      `);
    }
    
    // Check if 'space_id' column exists
    const spaceIdColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'space_id'
      );
    `);
    
    // Handle DrizzleORM result
    const spaceIdRows = spaceIdColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasSpaceIdColumn = spaceIdRows.length > 0 && spaceIdRows[0].exists;
    
    if (!hasSpaceIdColumn) {
      console.log('Adding space_id column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN space_id INTEGER REFERENCES spaces(id) ON DELETE SET NULL;
      `);
    }
    
    // Check if 'enabled' column exists
    const enabledColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'enabled'
      );
    `);
    
    // Handle DrizzleORM result
    const enabledRows = enabledColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasEnabledColumn = enabledRows.length > 0 && enabledRows[0].exists;
    
    if (!hasEnabledColumn) {
      console.log('Adding enabled column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
      `);
    }
    
    // Check if 'email_recipients' column exists
    const emailRecipientsColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'email_recipients'
      );
    `);
    
    // Handle DrizzleORM result
    const emailRecipientsRows = emailRecipientsColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasEmailRecipientsColumn = emailRecipientsRows.length > 0 && emailRecipientsRows[0].exists;
    
    if (!hasEmailRecipientsColumn) {
      console.log('Adding email_recipients column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN email_recipients TEXT;
      `);
    }
    
    // Check if 'slack_webhook' column exists
    const slackWebhookColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'slack_webhook'
      );
    `);
    
    // Handle DrizzleORM result
    const slackWebhookRows = slackWebhookColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasSlackWebhookColumn = slackWebhookRows.length > 0 && slackWebhookRows[0].exists;
    
    if (!hasSlackWebhookColumn) {
      console.log('Adding slack_webhook column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN slack_webhook TEXT;
      `);
    }
    
    // Check if 'custom_webhook' column exists
    const customWebhookColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'custom_webhook'
      );
    `);
    
    // Handle DrizzleORM result
    const customWebhookRows = customWebhookColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasCustomWebhookColumn = customWebhookRows.length > 0 && customWebhookRows[0].exists;
    
    if (!hasCustomWebhookColumn) {
      console.log('Adding custom_webhook column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN custom_webhook TEXT;
      `);
    }
    
    // Check if 'throttle_minutes' column exists
    const throttleMinutesColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'throttle_minutes'
      );
    `);
    
    // Handle DrizzleORM result
    const throttleMinutesRows = throttleMinutesColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasThrottleMinutesColumn = throttleMinutesRows.length > 0 && throttleMinutesRows[0].exists;
    
    if (!hasThrottleMinutesColumn) {
      console.log('Adding throttle_minutes column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN throttle_minutes INTEGER NOT NULL DEFAULT 60;
      `);
    }
    
    // Check if 'last_triggered_at' column exists
    const lastTriggeredAtColumnCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'db_qa_alerts'
        AND column_name = 'last_triggered_at'
      );
    `);
    
    // Handle DrizzleORM result
    const lastTriggeredAtRows = lastTriggeredAtColumnCheck as unknown as Array<{ exists: boolean }>;
    const hasLastTriggeredAtColumn = lastTriggeredAtRows.length > 0 && lastTriggeredAtRows[0].exists;
    
    if (!hasLastTriggeredAtColumn) {
      console.log('Adding last_triggered_at column to db_qa_alerts...');
      await db.execute(sql`
        ALTER TABLE db_qa_alerts
        ADD COLUMN last_triggered_at TIMESTAMP;
      `);
    }
    
    // Check if db_qa_alert_history table exists
    const historyTableCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'db_qa_alert_history'
      );
    `);
    
    // Handle DrizzleORM result
    const historyRows = historyTableCheck as unknown as Array<{ exists: boolean }>;
    const hasHistoryTable = historyRows.length > 0 && historyRows[0].exists;
    
    if (!hasHistoryTable) {
      console.log('Creating db_qa_alert_history table...');
      
      // Create the db_qa_alert_history table to track alert triggers
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS db_qa_alert_history (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL REFERENCES db_qa_alerts(id) ON DELETE CASCADE,
          triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) NOT NULL,
          details TEXT,
          notifications_sent JSONB,
          execution_id INTEGER REFERENCES db_qa_execution_results(id) ON DELETE SET NULL
        );
        
        CREATE INDEX db_qa_alert_history_alert_id_idx ON db_qa_alert_history(alert_id);
        CREATE INDEX db_qa_alert_history_triggered_at_idx ON db_qa_alert_history(triggered_at);
      `);
    }
    
    console.log('DB QA alert tables updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating DB QA alert tables:', error);
    throw error;
  }
}