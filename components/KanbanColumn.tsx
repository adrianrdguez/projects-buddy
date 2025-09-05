import { KanbanColumnProps } from "@/lib/types";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({ column, onTaskClick, onTaskExecute }: KanbanColumnProps) {
  const getColumnTheme = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          header: 'text-foreground',
          badge: 'bg-success/10 text-success-foreground',
          border: 'border-border'
        };
      case 'yellow':
        return {
          header: 'text-foreground',
          badge: 'bg-secondary/20 text-secondary-foreground',
          border: 'border-border'
        };
      case 'blue':
        return {
          header: 'text-foreground',
          badge: 'bg-primary/10 text-primary',
          border: 'border-border'
        };
      case 'gray':
        return {
          header: 'text-foreground',
          badge: 'bg-muted text-muted-foreground',
          border: 'border-border'
        };
      default:
        return {
          header: 'text-foreground',
          badge: 'bg-muted text-muted-foreground',
          border: 'border-border'
        };
    }
  };

  const theme = getColumnTheme(column.theme);
  const taskCount = column.tasks.length;

  return (
    <div className={`flex flex-col h-full border rounded-xl ${theme.border} bg-card backdrop-blur-sm shadow-sm overflow-hidden`}>
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.border} min-w-0`}>
        <h3 className={`font-semibold text-sm tracking-tight ${theme.header} truncate flex-1 min-w-0`}>{column.title}</h3>
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${theme.badge} flex-shrink-0`}>
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
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
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