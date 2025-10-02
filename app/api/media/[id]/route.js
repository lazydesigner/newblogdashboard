// app/api/media/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaItem from '@/models/MediaItem';
import { requireAuth } from '@/lib/auth';

// GET single media item by ID
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const mediaItem = await MediaItem.findById(params.id);
    
    if (!mediaItem) {
      return NextResponse.json({ success: false, error: 'Media item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: mediaItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE media item by ID
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const mediaItem = await MediaItem.findByIdAndDelete(params.id);
    
    if (!mediaItem) {
      return NextResponse.json({ success: false, error: 'Media item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}