"use client";

import { ArrowRight, Sparkles, Code, Zap } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export function HeroSection() {
  return (
    <section className="relative px-6 sm:px-8 py-20 sm:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white mb-8 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            The AI planner that turns ideas into executable code
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 animate-slideUp">
            From{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ideas
            </span>
            {' '}to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Code
            </span>
            <br />
            <span className="text-4xl sm:text-6xl">Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-slideUp delay-200">
            Describe your project and watch AI break it down into organized tasks, then send them directly to your IDE. 
            No context switching, no manual planning—just pure development flow.
          </p>

          {/* Workflow visualization */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-slideUp delay-400">
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Describe Project</p>
                <p className="text-gray-400 text-sm">Natural language input</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 sm:rotate-0" />

            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">AI Breakdown</p>
                <p className="text-gray-400 text-sm">Smart task planning</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 sm:rotate-0" />

            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">IDE Integration</p>
                <p className="text-gray-400 text-sm">Direct code delivery</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-slideUp delay-600">
            <GoogleSignInButton 
              size="lg" 
              className="text-lg px-8 py-4 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105" 
            />
            <p className="text-gray-400 text-sm mt-4">
              Free to start • No credit card required
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  );
}