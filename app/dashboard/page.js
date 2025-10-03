// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Image, Plus, TrendingUp, Eye, Edit } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalMedia: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const postsResponse = await fetch('/api/posts');
      const postsData = await postsResponse.json();
      
      // Fetch media
      const mediaResponse = await fetch('/api/media');
      const mediaData = await mediaResponse.json();
      
      if (postsData.success) {
        const posts = postsData.data;
        setStats({
          totalPosts: posts.length,
          publishedPosts: posts.filter(p => p.status === 'published').length,
          draftPosts: posts.filter(p => p.status === 'draft').length,
          totalMedia: mediaData.success ? mediaData.data.length : 0
        });
        
        // Get 5 most recent posts
        setRecentPosts(posts.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link href={link} className="block">
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
            <Icon size={24} className={color.replace('border-', 'text-')} />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your blog.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={stats.totalPosts}
          color="border-blue-500"
          link="/dashboard/posts"
        />
        <StatCard
          icon={TrendingUp}
          label="Published"
          value={stats.publishedPosts}
          color="border-green-500"
          link="/dashboard/posts?status=published"
        />
        <StatCard
          icon={Edit}
          label="Drafts"
          value={stats.draftPosts}
          color="border-yellow-500"
          link="/dashboard/posts?status=draft"
        />
        <StatCard
          icon={Image}
          label="Media Items"
          value={stats.totalMedia}
          color="border-purple-500"
          link="/dashboard/media"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/posts/new"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Plus size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Create New Post</h3>
              <p className="text-sm text-gray-600">Write a new blog post</p>
            </div>
          </Link>

          <Link
            href="/dashboard/media"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Image size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Upload Media</h3>
              <p className="text-sm text-gray-600">Add images to library</p>
            </div>
          </Link>

          <Link
            href="/dashboard/posts"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <FileText size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">View All Posts</h3>
              <p className="text-sm text-gray-600">Manage your content</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
          <Link
            href="/dashboard/posts"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first blog post</p>
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Create New Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {post.featuredImage?.url && (
                    <img
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt}
                      className="w-16 h-16 rounded object-cover mr-4 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                      {post.categories.length > 0 && (
                        <span className="text-sm text-gray-500">
                          • {post.categories[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/dashboard/posts/edit/${post._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_BASE_URL+'/'+post.slug}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Use descriptive titles for better SEO - they auto-generate into URL-friendly slugs!</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Always add alt text to images in the Media Library for better accessibility and SEO.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Fill out all SEO fields (Meta Title, Description, Keywords) before publishing.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Check the SEO section to see your auto-generated canonical URL.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}