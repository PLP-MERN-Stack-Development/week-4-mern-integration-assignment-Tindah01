import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
//import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { PostCard } from '@/components/PostCard';
//import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: async () => {
      const response = await api.get(`/posts?page=${currentPage}&limit=9`);
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: async () => {
      const response = await api.get('/posts?limit=3');
      return response.data.posts;
    },
  });

  if (postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-slate-900 mb-4"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            BlogHub
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Discover amazing stories, insights, and knowledge from our community of writers.
        </motion.p>
      </section>

      {/* Featured Posts */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-2xl font-bold text-slate-900">Featured Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <motion.a
                key={category.id}
                href={`/category/${category.slug}`}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors group"
              >
                <div 
                  className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name[0]}
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {category.post_count} posts
                </p>
              </motion.a>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section>
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-slate-900">Recent Posts</h2>
        </div>
        
        {postsData && postsData.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postsData.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {postsData.pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: postsData.pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, postsData.pagination.pages))}
                  disabled={currentPage === postsData.pagination.pages}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No posts available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}