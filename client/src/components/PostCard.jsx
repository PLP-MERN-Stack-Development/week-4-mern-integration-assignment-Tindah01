import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PostCard({ post }) {
  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <img
          src={post.featured_image || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
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

        <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          <Link to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        <p className="text-slate-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <User className="h-4 w-4" />
            <span>{post.author_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </article>
  );
}