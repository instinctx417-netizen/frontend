'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3 transition-colors">
              <span className="text-white font-bold text-sm">IX</span>
            </div>
            <span className="text-lg font-semibold text-black tracking-tight">InstinctX</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-12">
            <Link href="/platform" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
              Platform
            </Link>
            <Link href="/talent" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
              Talent
            </Link>
            <Link href="/process" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
              Process
            </Link>
            <Link href="/team" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
              Team
            </Link>
            {!isAuthenticated && (
              <Link href="/signup" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
                Ecosystem
              </Link>
            )}
            
            {loading ? (
              <div className="px-6 py-2.5 text-sm text-gray-400">Loading...</div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.userType === 'client' && (
                  <Link href="/dashboard" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
                    Dashboard
                  </Link>
                )}
                {user?.userType === 'admin' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
                    Admin Dashboard
                  </Link>
                )}
                {user?.userType === 'hr' && (
                  <Link href="/hr/dashboard" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
                    HR Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="group flex items-center space-x-2 px-3 ps-1.5 py-2.5 rounded-md transition-all duration-200 hover:bg-gray-100 h-10"
                >
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-black group-hover:text-gray-700 transition-colors">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="px-6 py-2.5 bg-gray-200 text-black text-sm font-medium hover:bg-gray-300 transition-all duration-200 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium transition-all duration-200 relative text-gray-500 hover:text-black">
                  Login
                </Link>
                <Link href="/signup" className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all duration-200">
                  Get Started
                </Link>
              </>
            )}
          </div>
          
          <button className="md:hidden p-2 text-black" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

