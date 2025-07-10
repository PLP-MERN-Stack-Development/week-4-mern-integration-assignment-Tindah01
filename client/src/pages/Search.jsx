import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
//import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['search-posts', searchQuery, currentPage],
    queryFn: async () => {
      const response = await api.get(`/posts?search=${searchQuery}&page=${currentPage}&limit=9`);
      return response.data;
    },
    enabled: !!searchQuery,
  });

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      setCurrentPage(1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Search Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <SearchIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Search Posts
            </h1>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for posts..."
                className="w-full px-4 py-3 pl-12 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
              <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <>
            <div className="text-center">
              <p className="text-slate-600">
                {isLoading ? 'Searching...' : `Search results for "${searchQuery}"`}
              </p>
              {postsData && (
                <p className="text-sm text-slate-500 mt-1">
                  {postsData.pagination.total} result{postsData.pagination.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : postsData && postsData.posts.length > 0 ? (
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
                <p className="text-slate-500 text-lg">No posts found for "{searchQuery}"</p>
                <p className="text-slate-400 mt-2">Try searching with different keywords</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}