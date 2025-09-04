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
        <div className="flex items-center gap-1 text-xs text-success">
          <CheckCircle className="w-3 h-3" />
          <span>Completado</span>
        </div>
      );
    }

    if (card.status === 'blocked') {
      return (
        <div className="flex items-center gap-1 text-xs text-secondary">
          <Link className="w-3 h-3" />
          <span>Bloqueado</span>
        </div>
      );
    }

    return (
      <Button
        onClick={handleExecuteTask}
        disabled={isExecuting}
        size="sm"
        className="h-6 text-xs px-2 bg-primary/80 hover:bg-primary text-primary-foreground"
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Ejecutando
          </>
        ) : (
          <>
            <Code className="w-3 h-3 mr-1" />
            Enviar
          </>
        )}
      </Button>
    );
  };

  return (
    <Card 
      className={`${getStatusColor(card.status)} rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-primary/40`}
      style={{
        position: 'absolute',
        left: card.position.x - card.size.width / 2,
        top: card.position.y - card.size.height / 2,
        width: card.size.width,
        height: card.size.height,
      }}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-foreground leading-tight flex-1">
            {card.title}
          </CardTitle>
          <div className="ml-2">
            {getStatusIcon(card.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 pb-3">
        <p className="text-muted-foreground text-xs leading-relaxed mb-2 line-clamp-2">
          {card.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {card.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{card.estimatedTime}</span>
              </div>
            )}
            {card.dependencies && card.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                <span>{card.dependencies.length}</span>
              </div>
            )}
          </div>
          
          {getActionButton()}
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
          <div className="flex items-center gap-1 mt-2 p-1 bg-success/10 border border-success/20 rounded text-xs">
            <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
            <p className="text-success truncate">{executionResult}</p>
          </div>
        )}
        
        {executionError && (
          <div className="flex items-center gap-1 mt-2 p-1 bg-destructive/10 border border-destructive/20 rounded text-xs">
            <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
            <p className="text-destructive truncate">{executionError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}