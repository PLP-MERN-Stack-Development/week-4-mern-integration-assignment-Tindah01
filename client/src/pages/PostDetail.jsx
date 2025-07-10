import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
//import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
//import toast from 'react-hot-toast';

export function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await api.get(`/posts/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const response = await api.get(`/comments/post/${post.id}`);
      return response.data;
    },
    enabled: !!post?.id,
  });

  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      const response = await api.post('/comments', commentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] });
      setComment('');
      toast.success('Comment added successfully!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user || !post) return;

    commentMutation.mutate({
      content: comment,
      post_id: post.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-slate-600">Post not found.</p>
          <Link to="/" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
            Go back to home
          </Link>
        </div>
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
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to posts
        </Link>

        {/* Post Header */}
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {post.featured_image && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.category_color }}
              >
                {post.category_name}
              </span>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
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

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 mb-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({comments?.length || 0})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={commentMutation.isPending}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-600">
                <Link to="/login" className="text-purple-600 hover:text-purple-700">
                  Log in
                </Link>{' '}
                to join the conversation.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments?.map((comment) => (
              <div key={comment.id} className="border-l-4 border-purple-200 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-slate-900">{comment.author_name}</span>
                  <span className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-slate-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}