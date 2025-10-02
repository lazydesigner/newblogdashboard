// app/(blog)/blog/[slug]/page.js
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogNavbar from '@/components/blog/BlogNavbar';
import BlogFooter from '@/components/blog/BlogFooter';
import { Calendar, Clock, Share2, ArrowLeft, Tag } from 'lucide-react';

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const post = await Post.findOne({ slug: params.slug, status: 'published' }).lean();
    
    if (!post) return {};
    
    return {
      title: post.metaTitle,
      description: post.metaDescription,
      keywords: post.keywords,
      alternates: {
        canonical: post.canonicalUrl,
      },
      openGraph: {
        title: post.metaTitle,
        description: post.metaDescription,
        url: post.canonicalUrl,
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        images: post.featuredImage?.url ? [
          {
            url: post.featuredImage.url,
            alt: post.featuredImage.alt,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.metaTitle,
        description: post.metaDescription,
        images: post.featuredImage?.url ? [post.featuredImage.url] : [],
      },
    };
  } catch (error) {
    return {};
  }
}

async function getPost(slug) {
  try {
    await connectDB();
    const post = await Post.findOne({ slug, status: 'published' }).lean();
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getRelatedPosts(slug, categories) {
  try {
    await connectDB();
    const posts = await Post.find({
      slug: { $ne: slug },
      status: 'published',
      categories: { $in: categories }
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    return [];
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(params.slug, post.categories);

  return (
    <div className="min-h-screen bg-white">
      <BlogNavbar />

      {/* Hero Section */}
      <article className="relative">
        {/* Featured Image */}
        {post.featuredImage?.url && (
          <div className="relative h-[60vh] bg-gray-900">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="max-w-4xl mx-auto px-6 pb-16">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Blog</span>
                </Link>
                
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{estimateReadTime(post.content)} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700
              prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.keywords.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag size={20} className="text-gray-400" />
                {post.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto px-6 py-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost._id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {relatedPost.featuredImage?.url && (
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img
                          src={relatedPost.featuredImage.url}
                          alt={relatedPost.featuredImage.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 space-y-3">
                      {relatedPost.categories[0] && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                          {relatedPost.categories[0]}
                        </span>
                      )}
                      
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.metaDescription}
                      </p>
                      
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold text-sm group/link"
                      >
                        Read More
                        <ArrowLeft size={16} className="rotate-180 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <BlogFooter />
    </div>
  );
}