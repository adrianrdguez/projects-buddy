"use client";

import { MessageSquare, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <MessageSquare className="w-4 h-4 text-black" />
              </div>
              <div className="text-xl font-semibold text-white">Projects Buddy</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Transform your ideas into structured development tasks with AI-powered project planning.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center hover:bg-white/[0.12] transition-colors">
                <Github className="w-4 h-4 text-white/80" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center hover:bg-white/[0.12] transition-colors">
                <Twitter className="w-4 h-4 text-white/80" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center hover:bg-white/[0.12] transition-colors">
                <Linkedin className="w-4 h-4 text-white/80" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-6">Product</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Projects Buddy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Status</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}