import { KanbanColumnProps } from "@/lib/types";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({ column, onTaskClick, onTaskExecute }: KanbanColumnProps) {
  const getColumnTheme = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          header: 'text-[#E4E4E7]',
          badge: 'bg-green-500/20 text-green-300',
          border: 'border-[#3A3B4C]'
        };
      case 'yellow':
        return {
          header: 'text-[#E4E4E7]',
          badge: 'bg-yellow-500/20 text-yellow-300',
          border: 'border-[#3A3B4C]'
        };
      case 'blue':
        return {
          header: 'text-[#E4E4E7]',
          badge: 'bg-blue-500/20 text-blue-300',
          border: 'border-[#3A3B4C]'
        };
      case 'gray':
        return {
          header: 'text-[#E4E4E7]',
          badge: 'bg-gray-500/20 text-gray-300',
          border: 'border-[#3A3B4C]'
        };
      default:
        return {
          header: 'text-[#E4E4E7]',
          badge: 'bg-gray-500/20 text-gray-300',
          border: 'border-[#3A3B4C]'
        };
    }
  };

  const theme = getColumnTheme(column.theme);
  const taskCount = column.tasks.length;

  return (
    <div className={`flex flex-col h-full border rounded-xl ${theme.border} bg-[#2A2B3A]/80 backdrop-blur-sm shadow-lg`}>
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
        <h3 className="font-semibold text-sm tracking-tight text-[#E4E4E7]">{column.title}</h3>
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${theme.badge}`}>
          {taskCount}
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0 custom-scrollbar">
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
          <div className="flex items-center justify-center h-32 text-[#A1A1AA] text-sm">
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