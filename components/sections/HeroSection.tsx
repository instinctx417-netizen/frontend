'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6 lg:px-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl opacity-10"></div>
      </div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h1 className="text-6xl lg:text-8xl font-bold text-black mb-8">
          Hiring,<br />
          <span className="bg-gradient-to-r from-black via-gray-500 to-black bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
            reimagined
          </span>.
        </h1>
        <p className="text-2xl lg:text-3xl text-black font-medium mb-6">
          Elite global talent. Unmatched precision. A new standard for startups.
        </p>
        <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
          No resumes. No interview rounds. Just AI-powered matching with{' '}
          <span className="font-semibold text-black">99% accuracy</span> — connecting you with elite operators in days, not months.
        </p>
        {!isAuthenticated && (
          <div className="relative inline-block">
            <Link
              href="/signup"
              className="relative inline-flex items-center px-8 py-4 bg-black text-white text-base font-medium hover:bg-gray-800 transition-colors group"
            >
              Experience the future of hiring
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

