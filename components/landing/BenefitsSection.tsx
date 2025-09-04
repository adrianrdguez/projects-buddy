"use client";

import { Brain, Workflow, Zap, Target, Shield, Rocket } from 'lucide-react';

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
  return (
    <section className="relative px-6 sm:px-8 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Developers Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Planner
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stop wasting time on project planning. Let AI handle the strategy so you can focus on what you do best—building amazing software.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white">
            <Rocket className="w-5 h-5" />
            Ready to revolutionize your development workflow?
          </div>
        </div>
      </div>
    </section>
  );
}