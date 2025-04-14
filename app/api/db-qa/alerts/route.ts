import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET handler for retrieving alerts
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    
    // Build the query with filters
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Begin building our SQL query with filters
    let query = `
      SELECT a.*, 
        q.name as query_name,
        s.name as space_name
      FROM db_qa_alerts a
      LEFT JOIN db_qa_queries q ON a.query_id = q.id
      LEFT JOIN spaces s ON a.space_id = s.id
      WHERE a.user_id = ${userIdNum}
    `;
    
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    if (spaceId) {
      query += ` AND a.space_id = $${paramCounter}`;
      queryParams.push(parseInt(spaceId));
      paramCounter++;
    }
    
    if (status) {
      query += ` AND a.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }
    
    if (severity) {
      query += ` AND a.severity = $${paramCounter}`;
      queryParams.push(severity);
      paramCounter++;
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    // Execute the query with parameters
    let result;
    if (queryParams.length > 0) {
      // We have parameters, use parameterized query
      let parametrizedQuery = query;
      for (let i = 0; i < queryParams.length; i++) {
        // Replace $N with actual parameter value
        parametrizedQuery = parametrizedQuery.replace(`$${i+1}`, Array.isArray(queryParams[i]) ? 
          `'${queryParams[i].join("','")}'` : 
          typeof queryParams[i] === 'string' ? `'${queryParams[i]}'` : String(queryParams[i]));
      }
      result = await db.execute(sql.raw(parametrizedQuery));
    } else {
      // No parameters, simpler query
      result = await db.execute(sql.raw(query));
    }
    
    // Transform the result to a serializable array
    const rows = Array.isArray(result) ? result : [];
    
    // Check if we need to process the data before returning
    const serializedRows = rows.map(row => {
      // Create a plain object with all enumerable properties
      const plainObject: Record<string, any> = {};
      for (const key in row) {
        let value = row[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        plainObject[key] = value;
      }
      return plainObject;
    });
    
    return NextResponse.json(serializedRows);
  } catch (error) {
    console.error('Error fetching DB QA alerts:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch DB QA alerts' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new alert
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.queryId || !body.severity || !body.condition || !body.notificationChannels) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert userId to number
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const queryIdNum = parseInt(body.queryId);
    
    // Check if the query exists and belongs to the user
    const queryResult = await db.execute(sql`
      SELECT * FROM db_qa_queries 
      WHERE id = ${queryIdNum} AND user_id = ${userIdNum}
    `);
    
    const queryRows = Array.isArray(queryResult) ? queryResult : [];
    if (queryRows.length === 0) {
      return NextResponse.json(
        { error: 'Query not found or access denied' },
        { status: 404 }
      );
    }
    
    // Get the query's space_id if present
    const spaceId = queryRows[0].space_id;
    
    // Insert the new alert
    await db.execute(sql`
      INSERT INTO db_qa_alerts (
        user_id, query_id, space_id, name, description, severity, 
        condition, notification_channels, email_recipients, slack_webhook, 
        custom_webhook, enabled, throttle_minutes
      ) VALUES (
        ${userIdNum}, ${queryIdNum}, ${spaceId}, ${body.name}, 
        ${body.description || null}, ${body.severity}, 
        ${JSON.stringify(body.condition)}::jsonb, ${JSON.stringify(body.notificationChannels)}::jsonb, 
        ${body.emailRecipients || null}, ${body.slackWebhook || null}, 
        ${body.customWebhook || null}, ${body.enabled !== undefined ? body.enabled : true}, 
        ${body.throttleMinutes || 60}
      )
    `);
    
    // Get the inserted alert
    const insertedAlert = await db.execute(sql`
      SELECT * FROM db_qa_alerts 
      WHERE user_id = ${userIdNum} AND name = ${body.name}
      ORDER BY id DESC LIMIT 1
    `);
    
    // Serialize the inserted alert result
    let alertResult = null;
    if (Array.isArray(insertedAlert) && insertedAlert.length > 0) {
      const row = insertedAlert[0];
      alertResult = {} as Record<string, any>;
      
      // Create a serializable object from the row
      for (const key in row) {
        let value = row[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        alertResult[key] = value;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'DB QA alert created successfully',
      alert: alertResult
    });
  } catch (error: any) {
    console.error('Error creating DB QA alert:', error);
    
    return NextResponse.json(
      { error: `Failed to create DB QA alert: ${error.message}` },
      { status: 500 }
    );
  }
}