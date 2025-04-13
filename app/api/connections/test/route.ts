import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pg from 'pg';

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
    
    // Get request body
    const data = await request.json();
    
    if (data.type === 'postgresql' || data.type === 'mysql') {
      // Test SQL database connection
      const { hostname, port, database, username, password, sslMode } = data;

      try {
        // Create a connection pool
        const pool = new pg.Pool({
          host: hostname,
          port: parseInt(port || '5432'),
          database,
          user: username,
          password,
          ssl: sslMode === 'disable' ? false : {
            rejectUnauthorized: sslMode === 'verify-full' || sslMode === 'verify-ca'
          },
          // Set a connection timeout
          connectionTimeoutMillis: 10000,
        });

        // Test the connection by making a simple query
        const client = await pool.connect();
        try {
          await client.query('SELECT NOW()');
          
          return NextResponse.json({
            success: true,
            message: 'Connection successful'
          });
        } finally {
          // Make sure to release the client even if an error occurs
          client.release();
          await pool.end();
        }
      } catch (error: any) {
        console.error('SQL connection test error:', error);
        
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to connect to the database'
        }, { status: 400 });
      }
    } else if (data.type === 'rest') {
      // Test REST API connection
      const { baseUrl, authType, apiKey, headerName } = data;
      
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        };
        
        // Add authentication headers
        if (authType === 'apikey' && apiKey && headerName) {
          headers[headerName] = apiKey;
        } else if (authType === 'bearer' && apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (authType === 'basic' && apiKey) {
          headers['Authorization'] = `Basic ${Buffer.from(apiKey).toString('base64')}`;
        }
        
        // Make a test request to the API
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: 'API connection successful'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: `API returned status code ${response.status}: ${response.statusText}`
          }, { status: 400 });
        }
      } catch (error: any) {
        console.error('REST API connection test error:', error);
        
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to connect to the API'
        }, { status: 400 });
      }
    } else {
      // CSV connections don't need testing
      return NextResponse.json({
        success: true,
        message: 'No connection test needed for this source type'
      });
    }
  } catch (error: any) {
    console.error('Connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}