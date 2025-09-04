"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic, Loader2 } from "lucide-react";
import { InputBarProps } from "@/lib/types";

interface ExtendedInputBarProps extends InputBarProps {
  isLoading?: boolean;
}

export function InputBar({ onSubmit, placeholder = "Describe tu tarea aquí...", isLoading = false, sidebarCollapsed = false }: ExtendedInputBarProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Get the scroll height (natural height of content)
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24; // 24px line height
      const maxLines = 8;
      const maxHeight = lineHeight * maxLines;
      
      // Set the height, but cap at maxHeight
      const newHeight = Math.min(scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Enable/disable overflow based on content
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Trigger height adjustment after state update
    setTimeout(adjustTextareaHeight, 0);
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasText = message.trim().length > 0;
  const isDisabled = isLoading || !hasText;

  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className={`${sidebarCollapsed ? 'pl-12' : 'pl-64'} pr-6 py-4 transition-all duration-300`}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className={`flex items-end bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200 px-4 py-3 ${
              isLoading ? 'opacity-75' : ''
            }`}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "Generando tareas..." : placeholder}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base disabled:cursor-not-allowed resize-none min-h-[24px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                style={{ 
                  lineHeight: '24px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              />
              
              <div className="flex items-center ml-2 pb-0">
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