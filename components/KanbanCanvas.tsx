import { useMemo } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { Task, KanbanColumn as KanbanColumnType, KanbanStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface KanbanCanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskExecute?: (task: Task) => void;
  isLoading?: boolean;
}

export function KanbanCanvas({ projectName, tasks, onTaskClick, onTaskExecute, isLoading = false }: KanbanCanvasProps) {
  // Create dependency-aware columns
  const columns = useMemo((): KanbanColumnType[] => {
    // Helper function to check if dependencies are met
    const areDependenciesMet = (task: Task): boolean => {
      if (!task.dependencies || task.dependencies.length === 0) return true;
      
      return task.dependencies.every(depId => 
        tasks.some(t => t.id === depId && t.status === 'completed')
      );
    };

    // Categorize tasks based on status and dependencies
    const categorizedTasks = tasks.reduce((acc, task) => {
      let status: KanbanStatus;
      
      switch (task.status) {
        case 'completed':
          status = 'completed';
          break;
        case 'in_progress':
          status = 'in_progress';
          break;
        default:
          // For pending/ready tasks, check dependencies
          status = areDependenciesMet(task) ? 'ready' : 'blocked';
          break;
      }
      
      if (!acc[status]) acc[status] = [];
      acc[status].push({ ...task, status });
      
      return acc;
    }, {} as Record<KanbanStatus, Task[]>);

    return [
      {
        id: 'ready',
        title: 'Ready to Start',
        theme: 'green',
        tasks: categorizedTasks.ready || []
      },
      {
        id: 'blocked',
        title: 'Waiting for Dependencies',
        theme: 'yellow',
        tasks: categorizedTasks.blocked || []
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        theme: 'blue',
        tasks: categorizedTasks.in_progress || []
      },
      {
        id: 'completed',
        title: 'Completed',
        theme: 'gray',
        tasks: categorizedTasks.completed || []
      }
    ];
  }, [tasks]);

  return (
    <div className="flex-1 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-foreground mb-2">
              {projectName}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLoading ? "Generando tareas con IA..." : "Tablero Kanban con dependencias"}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 px-6 pb-56 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-foreground animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Procesando tu solicitud...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onTaskClick={onTaskClick}
                  onTaskExecute={onTaskExecute}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay tareas aún
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Usa la barra de entrada de abajo para describir lo que quieres hacer y la IA generará tareas automáticamente con sus dependencias.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}