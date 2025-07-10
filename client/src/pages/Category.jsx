import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
//import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { PostCard } from '@/components/PostCard';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export function Category() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['category-posts', slug, currentPage],
    queryFn: async () => {
      const response = await api.get(`/posts?category=${slug}&page=${currentPage}&limit=9`);
      return response.data;
    },
    enabled: !!slug,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const category = categories?.find((cat) => cat.slug === slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Category Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4"
              style={{ backgroundColor: category?.color || '#8B5CF6' }}
            >
              <Tag className="h-6 w-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {category?.name || 'Category'}
            </h1>
          </div>
          {category?.description && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Posts Grid */}
        {postsData && postsData.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="text-slate-500 text-lg">No posts found in this category.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}