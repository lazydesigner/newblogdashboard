// app/api/posts/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { requireAuth } from '@/lib/auth';

// GET all posts
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    
    let query = {};
    if (status) query.status = status;
    if (authorId) query.authorId = authorId;
    
    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a new post
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    
    // Add authorId from authenticated user
    body.authorId = auth.user.id;
    
    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    // Auto-generate canonical URL if not provided
    if (!body.canonicalUrl && body.slug) {
      // You can change this base URL to your actual domain
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
      body.canonicalUrl = `${baseUrl}/blog/${body.slug}`;
    }
    
    const post = await Post.create(body);
    
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}