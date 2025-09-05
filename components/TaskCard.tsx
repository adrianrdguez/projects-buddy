import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCardProps, ExecuteTaskResponse } from "@/lib/types";
import { Code, Loader2, CheckCircle, AlertCircle, Clock, Link } from "lucide-react";

interface ExtendedTaskCardProps extends TaskCardProps {
  onExecute?: (task: any) => void;
  variant?: 'default' | 'kanban';
}

export function TaskCard({ task, onClick, onExecute, variant = 'default' }: ExtendedTaskCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const handleCardClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const handleExecuteTask = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (onExecute) {
      onExecute(task);
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
          taskId: task.id
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success-foreground">Completado</div>;
      case 'in_progress':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">En progreso</div>;
      case 'blocked':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">Bloqueado</div>;
      default:
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Listo</div>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Alta</div>;
      case 'medium':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">Media</div>;
      default:
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Baja</div>;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (variant === 'kanban') return '';
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getActionButton = () => {
    switch (task.status) {
      case 'ready':
        return (
          <Button
            onClick={handleExecuteTask}
            disabled={isExecuting}
            size="default"
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 min-h-[40px] overflow-hidden"
          >
            {isExecuting ? (
              <div className="flex items-center justify-center gap-2 truncate">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span className="truncate">Iniciando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 truncate">
                <Code className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Enviar a Editor</span>
              </div>
            )}
          </Button>
        );
      case 'blocked':
        return (
          <Button
            disabled
            size="default"
            variant="outline"
            className="w-full text-yellow-600 border-yellow-300 cursor-not-allowed min-h-[40px] overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 truncate">
              <Link className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Esperando dependencias</span>
            </div>
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            onClick={handleExecuteTask}
            disabled={isExecuting}
            size="default"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[40px] overflow-hidden"
          >
            {isExecuting ? (
              <div className="flex items-center justify-center gap-2 truncate">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span className="truncate">Continuando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 truncate">
                <Code className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Continuar</span>
              </div>
            )}
          </Button>
        );
      case 'completed':
        return (
          <Button
            disabled
            size="default"
            variant="outline"
            className="w-full text-gray-600 border-gray-300 cursor-not-allowed min-h-[40px] overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 truncate">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Completado</span>
            </div>
          </Button>
        );
      default:
        return null;
    }
  };

  if (variant === 'kanban') {
    return (
      <Card className="bg-card border border-border rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden min-h-[200px]">
        <CardHeader className="pb-4" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <div className="flex items-center justify-between mb-3 gap-2">
            <CardTitle className="text-base font-semibold text-foreground leading-tight truncate flex-1 min-w-0">
              {task.title}
            </CardTitle>
            <div className="flex-shrink-0">
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          
          {/* Time estimate and dependencies */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedTime || '1 hora'}</span>
            </div>
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <span>{task.dependencies.length} dep.</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 break-words">
            {task.description}
          </p>
          
          {/* Progress bar for in-progress tasks */}
          {task.status === 'in_progress' && task.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progreso</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary/80 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Execution feedback */}
          {executionResult && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-success/10 border border-success/20 rounded-lg overflow-hidden">
              <CheckCircle className="w-4 h-4 text-success-foreground flex-shrink-0" />
              <p className="text-success-foreground text-xs truncate flex-1">{executionResult}</p>
            </div>
          )}
          
          {executionError && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg overflow-hidden">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-destructive text-xs truncate flex-1">{executionError}</p>
            </div>
          )}
          
          {getActionButton()}
        </CardContent>
      </Card>
    );
  }

  // Default card layout (for backward compatibility)
  return (
    <Card
      className={`bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] border-l-4 ${getPriorityColor(task.priority)}`}
    >
      <CardHeader className="pb-3" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          Prioridad: {task.priority}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{task.description}</p>
        
        {/* Execution feedback */}
        {executionResult && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-success-foreground flex-shrink-0" />
            <p className="text-success-foreground text-xs">{executionResult}</p>
          </div>
        )}
        
        {executionError && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-destructive text-xs">{executionError}</p>
          </div>
        )}
        
        <Button
          onClick={handleExecuteTask}
          disabled={isExecuting}
          size="sm"
          className="w-full bg-muted hover:bg-accent text-foreground rounded-lg disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <Code className="w-4 h-4 mr-2" />
              Enviar a Editor
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}