// Server Component - Fetch data on server
async function getPosts() {
  try {
    // For development - use relative URL or environment variable
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL 
      : 'https://caffetest.onrender.com';
    
    const res = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
      // or use: cache: 'no-store' for always fresh data
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Latest insights, tutorials, and updates from our team
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.id || post._id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Featured Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-colors duration-300 flex items-center justify-center">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-semibold">Blog Post</span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                {post.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                    {post.category}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt || post.content?.substring(0, 150)}...
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {new Date(post.createdAt || post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span>{post.readTime || '5 min read'}</span>
                </div>

                {/* Read More Button */}
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 transform group-hover:scale-105">
                  Read More
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No blog posts yet</h3>
            <p className="text-gray-500">Check back later for new content!</p>
          </div>
        )}

        {/* Load More Button (for pagination) */}
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-md">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  const posts = await getPosts();
  
  return {
    title: 'Blog - Latest Posts & Insights',
    description: 'Explore our latest blog posts, tutorials, and industry insights.',
    keywords: posts.map(post => post.tags || []).flat().join(', '),
    openGraph: {
      title: 'Our Blog',
      description: 'Latest insights and updates from our team',
      type: 'website',
    },
  };
}