import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCardProps, ExecuteTaskResponse } from "@/lib/types";
import { Code, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function TaskCard({ task, onClick }: TaskCardProps) {
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
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completado</div>;
      case 'in_progress':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En progreso</div>;
      default:
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Pendiente</div>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <Card
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 border-l-4 ${getPriorityColor(task.priority)}`}
    >
      <CardHeader className="pb-3" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
        <div className="text-xs text-gray-500 capitalize">
          Prioridad: {task.priority}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{task.description}</p>
        
        {/* Execution feedback */}
        {executionResult && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-700 text-xs">{executionResult}</p>
          </div>
        )}
        
        {executionError && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-xs">{executionError}</p>
          </div>
        )}
        
        <Button
          onClick={handleExecuteTask}
          disabled={isExecuting}
          size="sm"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
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