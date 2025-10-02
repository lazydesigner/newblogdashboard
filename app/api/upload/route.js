// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MediaItem from '@/models/MediaItem';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const altText = formData.get('altText') || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: 'blog-uploads',
      resource_type: 'auto',
      transformation: [
        { width: 1200, crop: 'limit' }, // Limit max width
        { quality: 'auto' } // Auto quality
      ]
    });

    await connectDB();

    // Generate filename from original name or use Cloudinary public_id
    const fileName = file.name || `${uploadResponse.public_id}.${uploadResponse.format}`;

    // Create media item in database
    const mediaItem = await MediaItem.create({
      fileName: fileName,
      url: uploadResponse.secure_url,
      altText: altText || fileName,
      uploadedBy: auth.user.id,
      size: uploadResponse.bytes,
      uploadedAt: new Date()
    });

    return NextResponse.json(
      {
        success: true,
        data: mediaItem,
        message: 'File uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload configuration
export async function GET() {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    message: isConfigured
      ? 'Cloudinary is configured'
      : 'Cloudinary is not configured. Please add credentials to .env.local'
  });
}