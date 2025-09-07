import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MindMapCard } from "@/lib/mindmap-types";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

interface BranchCardProps {
  card: MindMapCard;
  taskCount: number;
  completedTasks: number;
  onClick?: (card: MindMapCard) => void;
  onToggleChildren?: (cardId: string) => void;
  childrenVisible: boolean;
  isProcessing?: boolean;
}

export function BranchCard({ 
  card, 
  taskCount, 
  completedTasks, 
  onClick, 
  onToggleChildren,
  childrenVisible,
  isProcessing = false
}: BranchCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleChildren) {
      onToggleChildren(card.id);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-success";
    if (progress >= 50) return "bg-primary";
    return "bg-secondary";
  };

  const progress = taskCount > 0 ? (completedTasks / taskCount) * 100 : 0;

  return (
    <Card 
      className={`bg-card border border-border/60 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/30 ${
        isProcessing ? 'animate-pulse shadow-lg' : ''
      }`}
      style={{
        position: 'absolute',
        left: card.position.x - card.size.width / 2,
        top: card.position.y - card.size.height / 2,
        width: card.size.width,
        height: card.size.height,
        boxShadow: isProcessing ? '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)' : undefined,
        border: isProcessing ? '2px solid #10b981' : undefined,
      }}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-foreground leading-tight flex-1">
            {card.title}
          </CardTitle>
          <button
            onClick={handleToggle}
            className="p-1 rounded hover:bg-muted transition-colors ml-2"
            title={childrenVisible ? "Ocultar tareas" : "Mostrar tareas"}
          >
            {childrenVisible ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
          {card.description}
        </p>
        
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {childrenVisible ? (
                <FolderOpen className="w-3 h-3 text-primary" />
              ) : (
                <Folder className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">
                {completedTasks}/{taskCount} tareas
              </span>
            </div>
            <div className="text-primary font-medium">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}