import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
//import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BlogHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <Link to="/" className="text-slate-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link to="/category/technology" className="text-slate-700 hover:text-purple-600 transition-colors">
                Technology
              </Link>
              <Link to="/category/design" className="text-slate-700 hover:text-purple-600 transition-colors">
                Design
              </Link>
              <Link to="/category/business" className="text-slate-700 hover:text-purple-600 transition-colors">
                Business
              </Link>
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-64 px-4 py-2 pl-10 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </form>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Write</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-slate-700 hover:text-purple-600 transition-colors">
                    <User className="h-5 w-5" />
                    <span>{user.username}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-t-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-b-lg"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-purple-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full px-4 py-2 pl-10 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              </form>
              
              <nav className="space-y-2">
                <Link to="/" className="block py-2 text-slate-700 hover:text-purple-600 transition-colors">
                  Home
                </Link>
                <Link to="/category/technology" className="block py-2 text-slate-700 hover:text-purple-600 transition-colors">
                  Technology
                </Link>
                <Link to="/category/design" className="block py-2 text-slate-700 hover:text-purple-600 transition-colors">
                  Design
                </Link>
                <Link to="/category/business" className="block py-2 text-slate-700 hover:text-purple-600 transition-colors">
                  Business
                </Link>
              </nav>

              {user ? (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <Link
                    to="/create"
                    className="block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full text-center"
                  >
                    Write Post
                  </Link>
                  <Link to="/profile" className="block py-2 text-slate-700 hover:text-purple-600 transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-slate-700 hover:text-purple-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <Link
                    to="/login"
                    className="block text-center py-2 text-slate-700 hover:text-purple-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}