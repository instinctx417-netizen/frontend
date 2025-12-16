'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface DotStyle {
  left: string;
  top: string;
  animation: string;
  animationDelay: string;
}

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  const [dots, setDots] = useState<DotStyle[]>([]);

  useEffect(() => {
    // Generate random values only on client side to avoid hydration mismatch
    const generatedDots = Array.from({ length: 20 }).map(() => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
    }));
    setDots(generatedDots);
  }, []);

  return (
    <section className="py-32 px-6 lg:px-12 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated dots background - subtle floating particles */}
        <div className="absolute inset-0">
          {dots.map((dot, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-20"
              style={dot}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold mb-8">
          Stop hiring the old way.
        </h2>
        <p className="text-xl font-light text-gray-300 mb-4 max-w-2xl mx-auto">
          Experience AI-powered matching that delivers the perfect operator —{' '}
          <span className="text-white font-medium">faster and more accurately</span> than traditional hiring ever could.
        </p>
        {!isAuthenticated && (
          <>
        <p className="text-sm font-light text-gray-400 mb-12">
          Limited to 15 placements per month. Apply now to secure your spot.
        </p>
        <div className="relative inline-block">
          <Link
                href="/signup"
            className="relative inline-flex items-center px-8 py-4 bg-white text-black text-base font-medium hover:bg-gray-100 transition-colors group"
          >
            Get matched with your operator
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
          </>
        )}
      </div>
    </section>
  );
}

