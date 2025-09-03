"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic } from "lucide-react";
import { InputBarProps } from "@/lib/types";

export function InputBar({ onSubmit, placeholder = "Describe tu tarea aquí..." }: InputBarProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasText = message.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-64 right-0 p-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-500 text-base"
            />
            
            <div className="flex items-center ml-2 relative">
              <div className="flex items-center">
                <Button
                  type="button"
                  size="icon"
                  className={`bg-transparent hover:bg-gray-100 text-gray-600 rounded-full w-8 h-8 transition-all duration-300 ease-out ${
                    hasText 
                      ? 'transform -translate-x-10' 
                      : 'transform translate-x-10'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
                <Button
                  type="submit"
                  size="icon"
                  className={`bg-gray-900 hover:bg-gray-800 text-white rounded-full w-8 h-8 ml-2 transition-all duration-300 ease-out ${
                    hasText 
                      ? 'transform translate-x-0 opacity-100 scale-100' 
                      : 'transform translate-x-0 opacity-0 scale-75 pointer-events-none'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
}