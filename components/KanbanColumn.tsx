import { KanbanColumnProps } from "@/lib/types";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({ column, onTaskClick, onTaskExecute }: KanbanColumnProps) {
  const getColumnTheme = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          header: 'bg-green-100 border-green-200 text-green-800',
          badge: 'bg-green-500 text-white',
          border: 'border-green-200'
        };
      case 'yellow':
        return {
          header: 'bg-yellow-100 border-yellow-200 text-yellow-800',
          badge: 'bg-yellow-500 text-white',
          border: 'border-yellow-200'
        };
      case 'blue':
        return {
          header: 'bg-blue-100 border-blue-200 text-blue-800',
          badge: 'bg-blue-500 text-white',
          border: 'border-blue-200'
        };
      case 'gray':
        return {
          header: 'bg-gray-100 border-gray-200 text-gray-800',
          badge: 'bg-gray-500 text-white',
          border: 'border-gray-200'
        };
      default:
        return {
          header: 'bg-gray-100 border-gray-200 text-gray-800',
          badge: 'bg-gray-500 text-white',
          border: 'border-gray-200'
        };
    }
  };

  const theme = getColumnTheme(column.theme);
  const taskCount = column.tasks.length;

  return (
    <div className={`flex flex-col h-full border rounded-lg ${theme.border} bg-white`}>
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 border-b rounded-t-lg ${theme.header} ${theme.border}`}>
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${theme.badge}`}>
          {taskCount}
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onExecute={onTaskExecute}
              variant="kanban"
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <div className="text-center">
              <div className="mb-2 opacity-50">
                <svg
                  className="w-8 h-8 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              Sin tareas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}