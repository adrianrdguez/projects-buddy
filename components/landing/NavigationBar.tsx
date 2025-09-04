"use client";

import { MessageSquare } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export function NavigationBar() {
  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Planner</h1>
              <p className="text-xs text-gray-300">Turn ideas into code</p>
            </div>
          </div>

          {/* Auth Button */}
          <GoogleSignInButton size="sm" className="shadow-lg hover:shadow-xl transition-shadow" />
        </div>
      </div>
    </nav>
  );
}