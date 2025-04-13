import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db';

// This endpoint is meant to be used to run migrations 
export async function GET(request: NextRequest) {
  try {
    console.log('Starting database migrations...');
    
    // Run all migrations including DB QA tables
    await runMigrations();
    
    return NextResponse.json({ success: true, message: 'Migrations completed successfully' });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json({ error: 'Failed to run migrations', details: String(error) }, { status: 500 });
  }
}