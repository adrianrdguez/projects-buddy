import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MindMapCard } from "@/lib/mindmap-types";
import { ExecuteTaskResponse } from "@/lib/types";
import { Code, Loader2, CheckCircle, AlertCircle, Clock, Link, Play, Pause } from "lucide-react";

interface MindMapTaskCardProps {
  card: MindMapCard;
  onClick?: (card: MindMapCard) => void;
  onExecute?: (card: MindMapCard) => void;
}

export function MindMapTaskCard({ card, onClick, onExecute }: MindMapTaskCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const handleCardClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const handleExecuteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onExecute) {
      onExecute(card);
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);

    try {
      const response = await fetch('/api/execute-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: card.id
        })
      });

      const data: ExecuteTaskResponse = await response.json();

      if (data.success) {
        setExecutionResult(`Code generated successfully! ${data.filePath ? `File: ${data.filePath}` : ''}`);
      } else {
        setExecutionError(data.error || 'Failed to execute task');
      }
    } catch (error) {
      setExecutionError('Network error: Could not connect to server');
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'in_progress':
        return <Play className="w-3 h-3 text-primary" />;
      case 'blocked':
        return <Pause className="w-3 h-3 text-secondary" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success/30 bg-success/5';
      case 'in_progress':
        return 'border-primary/30 bg-primary/5';
      case 'blocked':
        return 'border-secondary/30 bg-secondary/5';
      default:
        return 'border-border/60 bg-card';
    }
  };

  const getActionButton = () => {
    if (card.status === 'completed') {
      return (
        <div className="flex items-center gap-1 text-xs text-success min-w-0">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Completado</span>
        </div>
      );
    }

    if (card.status === 'blocked') {
      return (
        <div className="flex items-center gap-1 text-xs text-secondary min-w-0">
          <Link className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Bloqueado</span>
        </div>
      );
    }

    return (
      <Button
        onClick={handleExecuteTask}
        disabled={isExecuting}
        size="sm"
        className="h-8 text-sm px-3 bg-primary/80 hover:bg-primary text-primary-foreground min-w-0 overflow-hidden"
      >
        {isExecuting ? (
          <div className="flex items-center gap-1 min-w-0">
            <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
            <span className="truncate">Ejecutando</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 min-w-0">
            <Code className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Enviar</span>
          </div>
        )}
      </Button>
    );
  };

  return (
    <Card 
      className={`${getStatusColor(card.status)} rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-primary/40 overflow-hidden`}
      style={{
        position: 'absolute',
        left: card.position.x - card.size.width / 2,
        top: card.position.y - card.size.height / 2,
        width: card.size.width,
        height: card.size.height,
      }}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium text-foreground leading-tight flex-1 min-w-0 truncate">
            {card.title}
          </CardTitle>
          <div className="flex-shrink-0">
            {getStatusIcon(card.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2 break-words">
          {card.description}
        </p>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {card.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{card.estimatedTime}</span>
              </div>
            )}
            {card.dependencies && card.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <span>{card.dependencies.length} dep.</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            {getActionButton()}
          </div>
        </div>

        {/* Progress bar for in-progress tasks */}
        {card.status === 'in_progress' && card.progress !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-primary/80 h-1 rounded-full transition-all duration-300"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Execution feedback */}
        {executionResult && (
          <div className="flex items-center gap-1 mt-2 p-1 bg-success/10 border border-success/20 rounded text-xs overflow-hidden">
            <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
            <p className="text-success truncate flex-1 min-w-0">{executionResult}</p>
          </div>
        )}
        
        {executionError && (
          <div className="flex items-center gap-1 mt-2 p-1 bg-destructive/10 border border-destructive/20 rounded text-xs overflow-hidden">
            <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
            <p className="text-destructive truncate flex-1 min-w-0">{executionError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}