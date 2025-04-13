import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

    const userId = session.user.id;
    const datasetId = parseInt(params.id);
    
    if (isNaN(datasetId)) {
      return NextResponse.json(
        { error: 'Invalid dataset ID' },
        { status: 400 }
      );
    }
    
    // Get dataset
    const datasetResult = await db.execute(
      sql`SELECT * FROM datasets WHERE id = ${datasetId} AND user_id = ${userId}`
    );
    
    if (!Array.isArray(datasetResult) || datasetResult.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Get the dataset
    const dataset = datasetResult[0];
    
    // Process the dataset to be serializable
    const plainObject: Record<string, any> = {};
    for (const key in dataset) {
      let value = dataset[key];
      // Convert dates to ISO strings
      if (value instanceof Date) {
        value = value.toISOString();
      }
      plainObject[key] = value;
    }
    
    return NextResponse.json(plainObject);
  } catch (error) {
    console.error('Dataset fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const userId = session.user.id;
    const datasetId = parseInt(params.id);
    
    if (isNaN(datasetId)) {
      return NextResponse.json(
        { error: 'Invalid dataset ID' },
        { status: 400 }
      );
    }
    
    // Verify dataset exists and belongs to user
    const datasetResult = await db.execute(
      sql`SELECT id FROM datasets WHERE id = ${datasetId} AND user_id = ${userId}`
    );
    
    if (!Array.isArray(datasetResult) || datasetResult.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    // Delete dataset
    await db.execute(
      sql`DELETE FROM datasets WHERE id = ${datasetId} AND user_id = ${userId}`
    );
    
    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Dataset deletion error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete dataset' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const userId = session.user.id;
    const datasetId = parseInt(params.id);
    
    if (isNaN(datasetId)) {
      return NextResponse.json(
        { error: 'Invalid dataset ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Verify dataset exists and belongs to user
    const datasetResult = await db.execute(
      sql`SELECT id FROM datasets WHERE id = ${datasetId} AND user_id = ${userId}`
    );
    
    if (!Array.isArray(datasetResult) || datasetResult.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Build update fields
    const updateFields = [];
    const values: any[] = [];
    
    if (body.name) {
      updateFields.push('name = $1');
      values.push(body.name);
    }
    
    if (body.query) {
      updateFields.push('query = $2');
      values.push(body.query);
    }
    
    if (body.refresh_interval) {
      updateFields.push('refresh_interval = $3');
      values.push(body.refresh_interval);
    }
    
    if (body.connection_id) {
      updateFields.push('connection_id = $4');
      values.push(parseInt(body.connection_id));
    }
    
    if (body.config) {
      updateFields.push('config = $5');
      values.push(JSON.stringify(body.config));
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Update dataset
    const updateResult = await db.execute(
      sql`
        UPDATE datasets 
        SET ${sql.raw(updateFields.join(', '))}, updated_at = NOW()
        WHERE id = ${datasetId} AND user_id = ${userId}
        RETURNING *
      `,
      ...values
    );
    
    // Get updated dataset
    const updatedDataset = Array.isArray(updateResult) && updateResult.length > 0 
      ? updateResult[0] 
      : null;
    
    if (!updatedDataset) {
      return NextResponse.json(
        { error: 'Failed to update dataset' },
        { status: 500 }
      );
    }
    
    // Process the dataset to be serializable
    const plainObject: Record<string, any> = {};
    for (const key in updatedDataset) {
      let value = updatedDataset[key];
      // Convert dates to ISO strings
      if (value instanceof Date) {
        value = value.toISOString();
      }
      plainObject[key] = value;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dataset updated successfully',
      dataset: plainObject
    });
  } catch (error) {
    console.error('Dataset update error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    );
  }
}