"use client";

import { Brain, Workflow, Zap, Target, Shield, Rocket, ArrowUpRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const benefits = [
  {
    icon: Brain,
    title: "Intelligent Task Planning",
    description: "AI understands your project context and creates logical, dependency-aware task breakdowns that make sense.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Workflow,
    title: "No Context Switching",
    description: "Stay in your development flow. Tasks are sent directly to your IDE with all the context you need.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Direct IDE Integration",
    description: "Seamlessly integrates with Claude Code to execute tasks automatically in your development environment.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Target,
    title: "Precise Execution",
    description: "Each task comes with specific file paths, implementation details, and optimized prompts for accuracy.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Smart Dependencies",
    description: "Automatically manages task dependencies and execution order to prevent conflicts and ensure smooth development.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: Rocket,
    title: "Accelerated Development",
    description: "Transform weeks of planning into minutes. Focus on coding, not project management.",
    gradient: "from-pink-500 to-rose-500"
  }
];

export function BenefitsSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation of cards
            benefits.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...prev, index]);
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative px-6 sm:px-8 py-24 sm:py-32 bg-gradient-to-b from-black via-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/80 mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Why choose us
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Built for modern
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              development
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Every feature designed to eliminate friction and amplify your development velocity.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isVisible = visibleCards.includes(index);
            return (
              <div
                key={index}
                className={`group relative p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-500"></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/[0.08] rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/[0.12] transition-all duration-300">
                    <Icon className="w-6 h-6 text-white/80 group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-white/90 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {benefit.description}
                  </p>

                  {/* Arrow icon on hover */}
                  <ArrowUpRight className="w-4 h-4 text-white/40 absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow demonstration */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See it in action
            </h3>
            <p className="text-gray-400 text-lg">
              From idea to implementation in seconds
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Describe</p>
                <p className="text-gray-400 text-xs">Natural language</p>
              </div>
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="w-8 h-px bg-white/20 sm:hidden"></div>

            <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Process</p>
                <p className="text-gray-400 text-xs">AI planning</p>
              </div>
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="w-8 h-px bg-white/20 sm:hidden"></div>

            <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Execute</p>
                <p className="text-gray-400 text-xs">Direct to IDE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}