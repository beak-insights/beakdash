import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET handler for retrieving alert history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse alert ID
    const id = await params.id;
    const alertId = parseInt(id);
    
    if (isNaN(alertId)) {
      return NextResponse.json(
        { error: 'Invalid alert ID' },
        { status: 400 }
      );
    }

    // Check if alert exists and belongs to the user
    const alertCheckResult = await db.execute(sql`
      SELECT * FROM db_qa_alerts 
      WHERE id = ${alertId} AND user_id = ${session.user.id}
    `);

    const alertRows = Array.isArray(alertCheckResult) ? alertCheckResult : [];
    if (alertRows.length === 0) {
      return NextResponse.json(
        { error: 'Alert not found or access denied' },
        { status: 404 }
      );
    }

    // Get alert history
    const historyResult = await db.execute(sql`
      SELECT *
      FROM db_qa_alert_history
      WHERE alert_id = ${alertId}
      ORDER BY triggered_at DESC
      LIMIT 50
    `);

    // Transform the result to a serializable array
    const rows = Array.isArray(historyResult) ? historyResult : [];
    
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
    console.error('Error fetching alert history:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch alert history' },
      { status: 500 }
    );
  }
}