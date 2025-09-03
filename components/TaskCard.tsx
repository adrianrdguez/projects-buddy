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
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Completado</div>;
      case 'in_progress':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">En progreso</div>;
      case 'blocked':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">Bloqueado</div>;
      default:
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">Listo</div>;
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
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Enviar a Editor
              </>
            )}
          </Button>
        );
      case 'blocked':
        return (
          <Button
            disabled
            size="sm"
            variant="outline"
            className="w-full text-yellow-600 border-yellow-300 cursor-not-allowed"
          >
            <Link className="w-4 h-4 mr-2" />
            Esperando dependencias
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            onClick={handleExecuteTask}
            disabled={isExecuting}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Continuando...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Continuar
              </>
            )}
          </Button>
        );
      case 'completed':
        return (
          <Button
            disabled
            size="sm"
            variant="outline"
            className="w-full text-gray-600 border-gray-300 cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completado
          </Button>
        );
      default:
        return null;
    }
  };

  if (variant === 'kanban') {
    return (
      <Card className="bg-[#2F303E] border border-[#3A3B4C] rounded-xl p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="pb-3" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-sm font-semibold text-[#E4E4E7] leading-tight">
              {task.title}
            </CardTitle>
            {getPriorityBadge(task.priority)}
          </div>
          
          {/* Time estimate and dependencies */}
          <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedTime || '1 hora'}</span>
            </div>
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                <span>{task.dependencies.length} dep.</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-[#A1A1AA] text-xs leading-relaxed mb-3 line-clamp-2">
            {task.description}
          </p>
          
          {/* Progress bar for in-progress tasks */}
          {task.status === 'in_progress' && task.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#A1A1AA] mb-1">
                <span>Progreso</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-[#3A3B4C] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Dependencies list */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="mb-3 p-2 bg-[#2A2B3A] rounded-lg border border-[#3A3B4C]">
              <div className="text-xs text-[#A1A1AA] font-medium mb-1">Dependencias:</div>
              <div className="space-y-1">
                {task.dependencies.slice(0, 2).map((depId) => (
                  <div key={depId} className="text-xs text-[#A1A1AA] flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#3A3B4C]" />
                    Task {depId.slice(-4)}
                  </div>
                ))}
                {task.dependencies.length > 2 && (
                  <div className="text-xs text-[#A1A1AA]">
                    +{task.dependencies.length - 2} más...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Execution feedback */}
          {executionResult && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
              <p className="text-green-300 text-xs">{executionResult}</p>
            </div>
          )}
          
          {executionError && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
              <p className="text-red-300 text-xs">{executionError}</p>
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
      className={`bg-[#2F303E] border border-[#3A3B4C] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-l-4 ${getPriorityColor(task.priority)}`}
    >
      <CardHeader className="pb-3" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#E4E4E7]">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
        <div className="text-xs text-[#A1A1AA] capitalize">
          Prioridad: {task.priority}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">{task.description}</p>
        
        {/* Execution feedback */}
        {executionResult && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
            <p className="text-green-300 text-xs">{executionResult}</p>
          </div>
        )}
        
        {executionError && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
            <p className="text-red-300 text-xs">{executionError}</p>
          </div>
        )}
        
        <Button
          onClick={handleExecuteTask}
          disabled={isExecuting}
          size="sm"
          className="w-full bg-[#2A2B3A] hover:bg-[#34364A] text-[#E4E4E7] rounded-lg disabled:opacity-50"
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