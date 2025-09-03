import { TaskCard } from "./TaskCard";
import { Task } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface CanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
}

export function Canvas({ projectName, tasks, onTaskClick, isLoading = false }: CanvasProps) {
  return (
    <div className="flex-1 bg-[#343541] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-medium text-white mb-2">
            {projectName}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLoading ? "Generando tareas con IA..." : "Gestiona las tareas de tu proyecto"}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Procesando tu solicitud...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-8">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
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
            <h3 className="text-lg font-medium text-white mb-2">
              No hay tareas aún
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Usa la barra de entrada de abajo para describir lo que quieres hacer y la IA generará tareas automáticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}