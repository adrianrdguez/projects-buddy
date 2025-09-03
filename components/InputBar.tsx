"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic, Loader2 } from "lucide-react";
import { InputBarProps } from "@/lib/types";

interface ExtendedInputBarProps extends InputBarProps {
  isLoading?: boolean;
}

export function InputBar({ onSubmit, placeholder = "Describe tu tarea aquí...", isLoading = false }: ExtendedInputBarProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
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
  const isDisabled = isLoading || !hasText;

  return (
    <div className="fixed bottom-6 left-64 right-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-center bg-[#2A2B3A] border border-[#3A3B4C] rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 px-4 py-3 ${
            isLoading ? 'opacity-75' : ''
          }`}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isLoading ? "Generando tareas..." : placeholder}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-[#E4E4E7] placeholder:text-[#A1A1AA] text-base disabled:cursor-not-allowed"
            />
            
            <div className="flex items-center ml-2 relative">
              <div className="flex items-center">
                <Button
                  type="button"
                  size="icon"
                  disabled={isLoading}
                  className={`bg-transparent hover:bg-[#2F303E] text-[#A1A1AA] rounded-full w-8 h-8 transition-all duration-300 ease-out disabled:opacity-50 ${
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
                  disabled={isDisabled}
                  className={`bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full w-8 h-8 ml-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasText 
                      ? 'transform translate-x-0 opacity-100 scale-100' 
                      : 'transform translate-x-0 opacity-0 scale-75 pointer-events-none'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
        
        <p className="text-xs text-[#A1A1AA] text-center mt-2">
          {isLoading 
            ? "Procesando con IA..." 
            : "Presiona Enter para enviar, Shift + Enter para nueva línea"
          }
        </p>
      </div>
    </div>
  );
}