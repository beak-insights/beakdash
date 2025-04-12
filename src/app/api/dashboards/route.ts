import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const spaceId = searchParams.get('spaceId');
    
    // Build query string
    let queryString = '';
    if (userId) queryString += `userId=${userId}&`;
    if (spaceId) queryString += `spaceId=${spaceId}&`;
    
    // Forward request to existing backend
    const url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/dashboards${queryString ? `?${queryString.slice(0, -1)}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch dashboards' },
        { status: response.status }
      );
    }
    
    const dashboards = await response.json();
    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication token
    const authToken = cookies().get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Forward request to existing backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/dashboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to create dashboard' },
        { status: response.status }
      );
    }
    
    const dashboard = await response.json();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Dashboard creation error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}