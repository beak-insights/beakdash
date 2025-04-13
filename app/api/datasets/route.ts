import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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
    
    // Query datasets based on filters
    let datasetData;
    
    // Make sure userId is a number
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    console.log('Fetching datasets for user ID:', userIdNum);
    
    try {
      if (spaceId) {
        const spaceIdNum = parseInt(spaceId);
        console.log('Fetching datasets for space ID:', spaceIdNum);
        datasetData = await db.execute(
          sql`SELECT * FROM datasets WHERE space_id = ${spaceIdNum} OR user_id = ${userIdNum}`
        );
      } else {
        // By default, get datasets accessible to the user
        datasetData = await db.execute(
          sql`SELECT * FROM datasets WHERE user_id = ${userIdNum}`
        );
      }
      
      console.log('Dataset data retrieved, row count:', Array.isArray(datasetData) ? datasetData.length : 'unknown');
    } catch (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }
    
    // Transform the result to a serializable array
    const datasets = Array.isArray(datasetData) ? datasetData : [];
    
    // Process the datasets to be serializable
    const serializedDatasets = datasets.map(dataset => {
      // Create a plain object with all enumerable properties
      const plainObject: Record<string, any> = {};
      for (const key in dataset) {
        let value = dataset[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        plainObject[key] = value;
      }
      return plainObject;
    });
    
    return NextResponse.json(serializedDatasets);
  } catch (error) {
    console.error('Datasets fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

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
    if (!body.name) {
      return NextResponse.json(
        { error: 'Dataset name is required' },
        { status: 400 }
      );
    }
    
    if (!body.connectionId) {
      return NextResponse.json(
        { error: 'Data connection is required' },
        { status: 400 }
      );
    }
    
    // Create dataset configuration from the body
    const config = {
      queryType: body.queryType || 'sql',
      sqlQuery: body.sqlQuery,
      refreshFrequency: body.refreshFrequency || 'manual',
      connectionId: body.connectionId,
      lastRefresh: null,
      schema: null, // will be populated after first run
    };
    
    // Make sure userId is a number
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const spaceIdNum = body.spaceId ? parseInt(body.spaceId) : null;
    const configJson = JSON.stringify(config);
    
    // The datasets table already exists with different columns
    // Based on the existing structure, we'll adapt our insert query
    
    // Check for space_id column existence first
    let hasSpaceIdColumn = false;
    try {
      const columnsResult = await db.execute(sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'datasets' AND column_name = 'space_id'
      `);
      hasSpaceIdColumn = Array.isArray(columnsResult) && columnsResult.length > 0;
      console.log('Space ID column exists:', hasSpaceIdColumn);
    } catch (error) {
      console.error('Error checking columns:', error);
    }
    
    // Prepare query and refresh interval
    const queryString = body.sqlQuery || '';
    const refreshInterval = body.refreshFrequency || 'manual';
    const connectionId = parseInt(body.connectionId);
    
    try {
      if (hasSpaceIdColumn) {
        // If space_id column exists, use it
        await db.execute(sql`
          INSERT INTO datasets (name, user_id, space_id, connection_id, query, refresh_interval, config)
          VALUES (${body.name}, ${userIdNum}, ${spaceIdNum}, ${connectionId}, ${queryString}, ${refreshInterval}, ${configJson}::jsonb)
        `);
      } else {
        // Otherwise use the base schema without space_id
        await db.execute(sql`
          INSERT INTO datasets (name, user_id, connection_id, query, refresh_interval, config)
          VALUES (${body.name}, ${userIdNum}, ${connectionId}, ${queryString}, ${refreshInterval}, ${configJson}::jsonb)
        `);
      }
    } catch (insertError) {
      console.error('Insert error details:', insertError);
      throw insertError;
    }
    
    // Get inserted dataset
    const insertedDataset = await db.execute(sql`
      SELECT * FROM datasets WHERE name = ${body.name} ORDER BY id DESC LIMIT 1
    `);
    
    // Serialize the dataset for the response
    let dataset = null;
    if (Array.isArray(insertedDataset) && insertedDataset.length > 0) {
      const data = insertedDataset[0];
      dataset = {} as Record<string, any>;
      
      // Create a serializable object from the row
      for (const key in data) {
        let value = data[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        dataset[key] = value;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dataset created successfully',
      dataset
    });
  } catch (error) {
    console.error('Dataset creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}