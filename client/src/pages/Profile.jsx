import React from 'react';
import { useAuth } from '../contexts/AuthContext';
//import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
//import { motion } from 'framer-motion';
import { User, Edit, Trash2, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function Profile() {
  const { user } = useAuth();

  const { data: userPosts, isLoading } = useQuery({
    queryKey: ['user-posts'],
    queryFn: async () => {
      const response = await api.get('/posts', {
        params: { author: user?.id, status: 'all' }
      });
      return response.data.posts;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-slate-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.username}</h1>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Edit className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Posts</p>
                <p className="text-2xl font-bold text-slate-900">{userPosts?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userPosts?.reduce((sum, post) => sum + post.views, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Likes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userPosts?.reduce((sum, post) => sum + post.likes, 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Your Posts</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {userPosts?.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/post/${post.slug}`}
                          className="text-lg font-semibold text-slate-900 hover:text-purple-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: post.category_color }}
                        >
                          {post.category_name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/edit/${post.id}`}
                        className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500">
                <p>You haven't written any posts yet.</p>
                <Link
                  to="/create"
                  className="text-purple-600 hover:text-purple-700 mt-2 inline-block"
                >
                  Write your first post
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}