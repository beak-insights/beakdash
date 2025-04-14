import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

/**
 * Seed script to add example notification data for testing
 */
async function seedNotifications() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // First, check if we have any alerts to associate notifications with
    const alertResult = await client.query(`
      SELECT id, user_id FROM db_qa_alerts LIMIT 1
    `);

    if (alertResult.rows.length === 0) {
      console.log('No alerts found. Please create at least one alert first.');
      return;
    }

    const alertId = alertResult.rows[0].id;
    const userId = alertResult.rows[0].user_id;

    // Check if alert history table exists
    const historyTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'db_qa_alert_history'
      );
    `);

    if (!historyTableCheck.rows[0].exists) {
      console.log('Alert history table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS db_qa_alert_history (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL,
          triggered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) NOT NULL,
          details TEXT,
          notifications_sent JSONB,
          execution_id INTEGER
        );
      `);
    }

    // Create a test alert history entry
    const historyResult = await client.query(`
      INSERT INTO db_qa_alert_history (
        alert_id, triggered_at, status, details, notifications_sent
      ) VALUES (
        $1, NOW(), 'success', 'Test alert triggered', '["email", "slack"]'
      ) RETURNING id
    `, [alertId]);

    const historyId = historyResult.rows[0].id;

    // Check if notification table exists
    const notificationTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'db_qa_alert_notifications'
      );
    `);

    if (!notificationTableCheck.rows[0].exists) {
      console.log('Notification table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS db_qa_alert_notifications (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL,
          channel VARCHAR(50) NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) NOT NULL,
          content JSONB NOT NULL,
          error_message TEXT,
          attempts INTEGER DEFAULT 1,
          alert_history_id INTEGER,
          retry_scheduled_for TIMESTAMP WITH TIME ZONE,
          recipient TEXT
        );
      `);
    }

    // Insert example notifications
    const notifications = [
      {
        channel: 'email',
        status: 'sent',
        content: { subject: 'Alert: Query threshold exceeded', body: 'Your database query alert was triggered' },
        recipient: 'user@example.com'
      },
      {
        channel: 'slack',
        status: 'failed',
        content: { text: 'Alert: Query threshold exceeded' },
        error_message: 'Failed to connect to Slack API: Invalid token',
        attempts: 3,
        retry_scheduled_for: new Date(Date.now() + 3600000).toISOString()
      },
      {
        channel: 'email',
        status: 'pending',
        content: { subject: 'Alert: Query error detected', body: 'Your query has failed to execute properly' },
        attempts: 1,
        recipient: 'admin@example.com'
      },
      {
        channel: 'webhook',
        status: 'delivered',
        content: { payload: { alert: 'Database integrity check failed' } },
        attempts: 1
      },
      {
        channel: 'slack',
        status: 'retrying',
        content: { text: 'Alert: Row count below minimum threshold' },
        error_message: 'Rate limit exceeded',
        attempts: 2,
        retry_scheduled_for: new Date(Date.now() + 1800000).toISOString()
      }
    ];

    console.log('Inserting test notifications...');

    for (const notification of notifications) {
      await client.query(`
        INSERT INTO db_qa_alert_notifications (
          alert_id, channel, status, content, error_message, attempts, alert_history_id, retry_scheduled_for, recipient
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        alertId,
        notification.channel,
        notification.status,
        JSON.stringify(notification.content),
        notification.error_message || null,
        notification.attempts || 1,
        historyId,
        notification.retry_scheduled_for || null,
        notification.recipient || null
      ]);
    }

    console.log('Example notifications created successfully!');
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await client.end();
  }
}

seedNotifications()
  .then(() => console.log('Seeding completed'))
  .catch(err => console.error('Seeding failed:', err));