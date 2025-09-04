"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic, Loader2 } from "lucide-react";
import { InputBarProps } from "@/lib/types";

interface ExtendedInputBarProps extends InputBarProps {
  isLoading?: boolean;
}

export function InputBar({ onSubmit, placeholder = "Describe tu tarea aquí...", isLoading = false, sidebarCollapsed = false }: ExtendedInputBarProps) {
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
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`${sidebarCollapsed ? 'pl-12' : 'pl-64'} pr-6 py-4 transition-all duration-300`}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className={`flex items-center bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200 px-4 py-3 ${
              isLoading ? 'opacity-75' : ''
            }`}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "Generando tareas..." : placeholder}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base disabled:cursor-not-allowed"
              />
              
              <div className="flex items-center ml-2">
                <Button
                  type="button"
                  size="icon"
                  disabled={isLoading}
                  className="bg-transparent hover:bg-accent text-muted-foreground rounded-full w-8 h-8 transition-all duration-300 ease-out disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                {(hasText || isLoading) && (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isDisabled}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-8 h-8 ml-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            {isLoading 
              ? "Procesando con IA..." 
              : "Presiona Enter para enviar, Shift + Enter para nueva línea"
            }
          </p>
        </div>
      </div>
    </div>
  );
}