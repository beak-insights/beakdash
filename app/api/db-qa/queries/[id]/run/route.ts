import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import pg from 'pg';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const queryId = parseInt(params.id);
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Retrieve the query definition
    const queryResult = await db.execute(sql`
      SELECT q.*, 
        c.name as connection_name,
        c.type as connection_type,
        c.config as connection_config
      FROM db_qa_queries q
      LEFT JOIN connections c ON q.connection_id = c.id
      WHERE q.id = ${queryId} AND q.user_id = ${userIdNum}
    `);
    
    if (!queryResult.rows || queryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Query not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const dbQuery = queryResult.rows[0];
    const connectionConfig = dbQuery.connection_config;
    
    // Only support SQL connections for now
    if (dbQuery.connection_type !== 'sql' && dbQuery.connection_type !== 'postgresql' && dbQuery.connection_type !== 'mysql') {
      return NextResponse.json(
        { error: 'Only SQL connections are supported for query execution' },
        { status: 400 }
      );
    }
    
    // Create connection pool to the database
    let status = 'success';
    let result: any = null;
    let metrics: any = {};
    let executionDuration = 0;
    let errorMessage: string | null = null;
    
    try {
      const pool = new pg.Pool({
        host: connectionConfig.hostname,
        port: parseInt(connectionConfig.port || '5432'),
        database: connectionConfig.database,
        user: connectionConfig.username,
        password: process.env.DB_PASSWORD || '********', // Use environment variable or placeholder
        ssl: connectionConfig.sslMode === 'disable' ? false : {
          rejectUnauthorized: connectionConfig.sslMode === 'verify-full' || connectionConfig.sslMode === 'verify-ca'
        },
        connectionTimeoutMillis: 30000, // 30 seconds for QA queries
      });

      const client = await pool.connect();
      try {
        // Set a timeout to prevent long-running queries
        await client.query('SET statement_timeout TO 25000'); // 25 seconds
        
        // Start timing the execution
        const startTime = Date.now();
        
        // Execute the query
        const queryResult = await client.query(dbQuery.query);
        
        // Calculate execution duration
        executionDuration = Date.now() - startTime;
        
        // Process the query result
        result = {
          rows: queryResult.rows,
          rowCount: queryResult.rowCount,
          fields: queryResult.fields.map(f => ({
            name: f.name,
            dataTypeID: f.dataTypeID,
            tableID: f.tableID,
          })),
        };
        
        // Calculate metrics based on the query type and category
        metrics = calculateMetrics(dbQuery.category, result);
        
        // Check if result meets expected criteria (if set)
        const thresholds = dbQuery.thresholds || {};
        if (Object.keys(thresholds).length > 0) {
          // Validate against thresholds
          const thresholdCheck = validateThresholds(metrics, thresholds);
          
          if (!thresholdCheck.valid) {
            status = 'warning';
            errorMessage = `Threshold check failed: ${thresholdCheck.reason}`;
          }
        }
        
      } catch (queryError: any) {
        status = 'error';
        errorMessage = queryError.message || 'Error executing query';
        console.error('Error executing DB QA query:', queryError);
      } finally {
        client.release();
        await pool.end();
      }
    } catch (connectionError: any) {
      status = 'error';
      errorMessage = `Connection error: ${connectionError.message}`;
      console.error('DB QA connection error:', connectionError);
    }
    
    // Save execution result to database
    try {
      const executionResult = await db.execute(sql`
        INSERT INTO db_qa_execution_results (
          query_id, status, result, metrics, execution_duration, error_message
        ) VALUES (
          ${queryId}, ${status}, ${JSON.stringify(result || {})}::jsonb, 
          ${JSON.stringify(metrics || {})}::jsonb, ${executionDuration}, ${errorMessage}
        ) RETURNING id
      `);
      
      // Update query with last execution time
      await db.execute(sql`
        UPDATE db_qa_queries SET
          last_execution_time = NOW(),
          next_execution_time = 
            CASE execution_frequency
              WHEN 'hourly' THEN NOW() + INTERVAL '1 hour'
              WHEN 'daily' THEN NOW() + INTERVAL '1 day'
              WHEN 'weekly' THEN NOW() + INTERVAL '1 week'
              WHEN 'monthly' THEN NOW() + INTERVAL '1 month'
              ELSE NULL
            END
        WHERE id = ${queryId}
      `);
      
      // If execution result indicates an issue and there are alerts configured,
      // generate alerts
      if (status !== 'success') {
        checkAndCreateAlerts(queryId, executionResult.rows ? executionResult.rows[0].id : null, metrics, status);
      }
      
      // Prepare response
      const response = {
        success: true,
        execution: {
          id: executionResult.rows ? executionResult.rows[0].id : null,
          status,
          result,
          metrics,
          executionDuration,
          errorMessage,
        }
      };
      
      return NextResponse.json(response);
    } catch (saveError: any) {
      console.error('Error saving DB QA execution result:', saveError);
      
      return NextResponse.json({
        success: false,
        error: `Error saving execution result: ${saveError.message}`,
        execution: {
          status,
          result,
          metrics,
          executionDuration,
          errorMessage,
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error running DB QA query:', error);
    
    return NextResponse.json(
      { error: `Failed to run DB QA query: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to calculate metrics based on query category
function calculateMetrics(category: string, result: any): Record<string, any> {
  const metrics: Record<string, any> = {
    rowCount: result?.rowCount || 0,
  };
  
  // Calculate category-specific metrics
  switch (category) {
    case 'data_completeness':
      // Calculate percentage of non-null values for each column
      if (result?.rows?.length > 0) {
        const columns = Object.keys(result.rows[0]);
        const totalRows = result.rows.length;
        
        columns.forEach(column => {
          const nonNullCount = result.rows.filter(row => row[column] !== null && row[column] !== undefined).length;
          metrics[`${column}_completeness`] = (nonNullCount / totalRows) * 100;
        });
        
        // Overall completeness
        const allValues = columns.length * totalRows;
        const nonNullValues = columns.reduce((sum, column) => {
          return sum + result.rows.filter(row => row[column] !== null && row[column] !== undefined).length;
        }, 0);
        
        metrics.overall_completeness = (nonNullValues / allValues) * 100;
      }
      break;
      
    case 'data_consistency':
      // For consistency checks, often the query itself returns statistics
      // so we just pass through the results
      if (result?.rows?.length > 0) {
        metrics.consistency_results = result.rows;
      }
      break;
      
    case 'data_accuracy':
      // Similar to consistency, accuracy checks usually have custom logic in the query
      if (result?.rows?.length > 0) {
        metrics.accuracy_results = result.rows;
      }
      break;
      
    case 'data_integrity':
      // Integrity checks often look for violated constraints
      if (result?.rows?.length > 0) {
        metrics.integrity_violations = result.rows.length;
        metrics.integrity_details = result.rows;
      }
      break;
      
    case 'data_timeliness':
      // Timeliness checks often have timestamps or date-based calculations
      if (result?.rows?.length > 0) {
        metrics.timeliness_results = result.rows;
      }
      break;
      
    case 'data_uniqueness':
      // Uniqueness checks often look for duplicates
      if (result?.rows?.length > 0) {
        metrics.duplicate_count = result.rows.length;
        metrics.duplicate_details = result.rows;
      }
      break;
      
    case 'data_relationship':
      // Relationship checks look for reference integrity issues
      if (result?.rows?.length > 0) {
        metrics.relationship_violations = result.rows.length;
        metrics.relationship_details = result.rows;
      }
      break;
      
    case 'sensitive_data_exposure':
      // Looking for sensitive data in unexpected places
      if (result?.rows?.length > 0) {
        metrics.exposure_count = result.rows.length;
        metrics.exposure_details = result.rows;
      }
      break;
  }
  
  return metrics;
}

// Helper function to validate metrics against thresholds
function validateThresholds(metrics: Record<string, any>, thresholds: Record<string, any>): { valid: boolean, reason?: string } {
  for (const [key, threshold] of Object.entries(thresholds)) {
    if (!metrics.hasOwnProperty(key)) {
      continue; // Skip if metric doesn't exist
    }
    
    const metricValue = metrics[key];
    const operator = threshold.operator || '>=';
    const value = threshold.value;
    
    let valid = true;
    switch (operator) {
      case '>':
        valid = metricValue > value;
        break;
      case '>=':
        valid = metricValue >= value;
        break;
      case '<':
        valid = metricValue < value;
        break;
      case '<=':
        valid = metricValue <= value;
        break;
      case '=':
      case '==':
        valid = metricValue === value;
        break;
      case '!=':
        valid = metricValue !== value;
        break;
    }
    
    if (!valid) {
      return { 
        valid: false, 
        reason: `Metric ${key} value ${metricValue} fails threshold (${operator} ${value})` 
      };
    }
  }
  
  return { valid: true };
}

// Helper function to check conditions and create alerts if needed
async function checkAndCreateAlerts(queryId: number, executionResultId: number | null, metrics: Record<string, any>, status: string) {
  try {
    // Get alert definitions for this query
    const alertDefs = await db.execute(sql`
      SELECT * FROM db_qa_alerts 
      WHERE query_id = ${queryId} AND status = 'active'
    `);
    
    if (!alertDefs.rows || alertDefs.rows.length === 0) {
      return; // No alerts defined
    }
    
    for (const alert of alertDefs.rows) {
      // Check if alert condition is met
      const condition = alert.condition;
      let conditionMet = false;
      
      // Simple status-based condition
      if (condition.status && condition.status === status) {
        conditionMet = true;
      }
      
      // Metric-based condition
      if (condition.metric && metrics.hasOwnProperty(condition.metric)) {
        const metricValue = metrics[condition.metric];
        const operator = condition.operator || '>';
        const value = condition.value;
        
        switch (operator) {
          case '>':
            conditionMet = metricValue > value;
            break;
          case '>=':
            conditionMet = metricValue >= value;
            break;
          case '<':
            conditionMet = metricValue < value;
            break;
          case '<=':
            conditionMet = metricValue <= value;
            break;
          case '=':
          case '==':
            conditionMet = metricValue === value;
            break;
          case '!=':
            conditionMet = metricValue !== value;
            break;
        }
      }
      
      // If condition is met, create a notification
      if (conditionMet && executionResultId) {
        await db.execute(sql`
          UPDATE db_qa_alerts 
          SET execution_result_id = ${executionResultId}, updated_at = NOW()
          WHERE id = ${alert.id}
        `);
        
        // Create notifications based on channels
        const channels = alert.notification_channels || [];
        for (const channel of channels) {
          await db.execute(sql`
            INSERT INTO db_qa_alert_notifications (
              alert_id, channel, status, content
            ) VALUES (
              ${alert.id}, ${channel}, 'sent', ${JSON.stringify({
                queryId,
                executionResultId,
                metrics,
                status,
                alertName: alert.name,
                timestamp: new Date().toISOString()
              })}::jsonb
            )
          `);
        }
      }
    }
  } catch (error) {
    console.error('Error processing alerts:', error);
    // Continue execution, don't fail the query just because alerts failed
  }
}