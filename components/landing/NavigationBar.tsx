"use client";

import { MessageSquare, ArrowRight } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { useState, useEffect } from 'react';

export function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-6'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
              <MessageSquare className="w-4 h-4 text-black" />
            </div>
            <div className="text-xl font-semibold text-white">Projects Buddy</div>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-white font-medium transition-colors duration-200">
              Features
            </a>
            <a href="#pricing" className="text-white/70 hover:text-white font-medium transition-colors duration-200">
              Pricing
            </a>
            <a href="#docs" className="text-white/70 hover:text-white font-medium transition-colors duration-200">
              Docs
            </a>
          </div>

          {/* Auth Button */}
          <div className="flex items-center gap-4">
            <GoogleSignInButton 
              size="sm" 
              className="bg-white text-black hover:bg-gray-100 border-0 font-medium transition-all duration-200" 
            />
          </div>
        </div>
      </div>
    </nav>
  );
}