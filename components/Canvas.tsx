import { TaskCard } from "./TaskCard";
import { Task } from "@/lib/types";

interface CanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function Canvas({ projectName, tasks, onTaskClick }: CanvasProps) {
  return (
    <div className="flex-1 bg-gray-900 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Proyecto: {projectName}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-4xl">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}