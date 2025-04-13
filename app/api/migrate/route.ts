import { NextRequest, NextResponse } from 'next/server';
import { migrateSpacesTable } from '@/lib/db/migrate-spaces';

// This endpoint is meant to be used temporarily to run migrations manually
export async function GET(request: NextRequest) {
  try {
    console.log('Starting migration...');
    
    // Run the spaces migration
    await migrateSpacesTable();
    
    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json({ error: 'Failed to run migration', details: String(error) }, { status: 500 });
  }
}