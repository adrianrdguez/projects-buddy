"use client";

import { ArrowRight, Play } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative px-6 sm:px-8 py-24 sm:py-40 overflow-hidden">
      {/* Linear-inspired background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-900 to-black"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-left">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/80 mb-8 w-fit transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            The AI planner that turns ideas into executable code
          </div>

          {/* Main heading */}
          <div className="relative">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-[0.9] tracking-tight transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '200ms'}}>
              Build ideas into <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  reality
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 blur-lg -z-10 animate-gradient"></div>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className={`text-xl sm:text-2xl text-gray-400 mb-16 max-w-3xl leading-relaxed font-light transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '400ms'}}>
            Transform natural language into structured development tasks. 
            <span className="text-white/80">AI breaks down complexity, you build with clarity.</span>
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-start gap-4 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '600ms'}}>
            <GoogleSignInButton 
              size="lg" 
              className="text-base px-8 py-4 bg-white text-black hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg font-medium h-[52px]" 
            />
            <button className="group inline-flex items-center gap-2 px-8 py-4 text-white/80 hover:text-white font-medium transition-all duration-300 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 h-[52px]">
              <Play className="w-5 h-5" />
              Watch demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Stats */}
          <div className={`flex flex-col sm:flex-row items-start gap-8 sm:gap-12 text-sm text-gray-500 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '800ms'}}>
            <div>
              <div className="text-2xl font-bold text-white mb-1">10k+</div>
              <div>Projects created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">50k+</div>
              <div>Tasks generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div>Uptime</div>
            </div>
          </div>

          {/* App Screenshot with 3D Perspective - Linear Style */}
          <div className={`relative mt-24 ${isVisible ? 'animate-slide-in-from-top-left' : 'opacity-0 -translate-y-32 -translate-x-32'}`}>
            <div className="relative mx-auto max-w-7xl px-4" style={{perspective: '1200px'}}>
              <div className="relative app-mockup">
                {/* Glow effects */}
                <div className="absolute -inset-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute -inset-16 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 rounded-2xl blur-xl opacity-80"></div>
                
                {/* Main screenshot container */}
                <div className="relative transform-gpu transition-all duration-1000 hover:scale-[1.02]" style={{
                  transform: 'translateX(15%) scale(1.5) rotateX(47deg) rotateY(31deg) rotate(324deg)',
                  transformStyle: 'preserve-3d'
                }}>
                  <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm">
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 z-10 pointer-events-none"></div>
                    
                    {/* Screenshot */}
                    <img 
                      src="/app-dark.png" 
                      alt="Taskana AI Planner Interface" 
                      className="w-full h-auto block"
                    />
                    
                    {/* Bottom gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30 pointer-events-none"></div>
                    
                    {/* Right gradient overlay */}
                    <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-30 pointer-events-none"></div>
                    
                    {/* Subtle reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent z-20 pointer-events-none"></div>
                  </div>
                  
                  {/* Reflection effect */}
                  <div className="absolute top-full left-0 right-0 h-full opacity-8 -z-10" style={{
                    transform: 'scaleY(-0.6) translateY(-20px) skewX(-5deg)',
                    filter: 'blur(2px)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 50%)'
                  }}>
                    <img 
                      src="/app-dark.png" 
                      alt="" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                
                {/* Ambient particles */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-ping" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full opacity-50 animate-ping" style={{animationDelay: '4s'}}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }

        @keyframes slide-in-from-top-left {
          0% {
            opacity: 0;
            transform: translateY(-8rem) translateX(-8rem);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }

        .animate-slide-in-from-top-left {
          animation: slide-in-from-top-left 4s ease-out 1.5s both;
        }
      `}</style>
    </section>
  );
}