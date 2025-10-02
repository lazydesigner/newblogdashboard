// app/(blog)/page.js
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogNavbar from '@/components/blog/BlogNavbar';
import BlogFooter from '@/components/blog/BlogFooter';
import { Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Blog - Latest Articles & Insights',
  description: 'Discover the latest articles, insights, and stories from our blog',
};

async function getPosts() {
  try {
    await connectDB();
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Error fetching posts:', error);
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

export default async function BlogHomePage() {
  const posts = await getPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);
  const olderPosts = posts.slice(7);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <BlogNavbar />

      {/* Hero Section with Featured Post */}
      {featuredPost && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTEyIDM2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  <TrendingUp size={16} className="mr-2" />
                  Featured Post
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  {featuredPost.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 line-clamp-3">
                  {featuredPost.metaDescription}
                </p>
                <div className="flex items-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(featuredPost.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{estimateReadTime(featuredPost.content)} min read</span>
                  </div>
                </div>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                >
                  Read Article
                  <ArrowRight size={20} />
                </Link>
              </div>
              
              {featuredPost.featuredImage?.url && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/50 to-pink-500/50 rounded-3xl transform rotate-3"></div>
                  <img
                    src={featuredPost.featuredImage.url}
                    alt={featuredPost.featuredImage.alt}
                    className="relative rounded-3xl shadow-2xl w-full aspect-video object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-gray-600">
            Explore our most recent posts and insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <article
              key={post._id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {post.featuredImage?.url && (
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
              
              <div className="p-6 space-y-4">
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.slice(0, 2).map((category, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 line-clamp-3 text-sm">
                  {post.metaDescription}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {estimateReadTime(post.content)} min
                    </span>
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 group/link"
                  >
                    Read
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Older Posts List */}
      {olderPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20 border-t">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            More Articles
          </h2>
          
          <div className="space-y-6">
            {olderPosts.map((post) => (
              <article
                key={post._id}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {post.featuredImage?.url && (
                    <div className="md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>{estimateReadTime(post.content)} min read</span>
                      {post.categories[0] && (
                        <>
                          <span>•</span>
                          <span className="text-purple-600 font-medium">
                            {post.categories[0]}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-2">
                      {post.metaDescription}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <BlogFooter />
    </div>
  );
}