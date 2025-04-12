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
    const connectionId = searchParams.get('connectionId');
    
    // Build query string
    let queryString = '';
    if (userId) queryString += `userId=${userId}&`;
    if (connectionId) queryString += `connectionId=${connectionId}&`;
    
    // Forward request to existing backend
    const url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/datasets${queryString ? `?${queryString.slice(0, -1)}` : ''}`;
    
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
        { message: errorData.message || 'Failed to fetch datasets' },
        { status: response.status }
      );
    }
    
    const datasets = await response.json();
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Datasets fetch error:', error);
    
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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/datasets`, {
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
        { message: errorData.message || 'Failed to create dataset' },
        { status: response.status }
      );
    }
    
    const dataset = await response.json();
    return NextResponse.json(dataset);
  } catch (error) {
    console.error('Dataset creation error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}