// app/api/media/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaItem from '@/models/MediaItem';
import { requireAuth } from '@/lib/auth';

// GET all media items
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const uploadedBy = searchParams.get('uploadedBy');
    
    let query = {};
    if (uploadedBy) query.uploadedBy = uploadedBy;
    
    const media = await MediaItem.find(query).sort({ uploadedAt: -1 });
    
    return NextResponse.json({ success: true, data: media }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a new media item
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.fileName || !body.url || !body.altText) {
      return NextResponse.json(
        { success: false, error: 'fileName, url, and altText are required' },
        { status: 400 }
      );
    }
    
    // Add uploadedBy from authenticated user
    body.uploadedBy = auth.user.id;
    
    const mediaItem = await MediaItem.create(body);
    
    return NextResponse.json({ success: true, data: mediaItem }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'File name or URL already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}