import { TaskCard } from "./TaskCard";
import { Task } from "@/lib/types";

interface CanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function Canvas({ projectName, tasks, onTaskClick }: CanvasProps) {
  return (
    <div className="flex-1 bg-[#343541] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-medium text-white mb-2">
            {projectName}
          </h2>
          <p className="text-gray-400 text-sm">Gestiona las tareas de tu proyecto</p>
        </div>
        
        <div className="space-y-8">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}