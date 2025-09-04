export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'ready' | 'blocked' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  dependencies: string[]; // Array of task IDs that must be completed first
  estimatedTime: string; // e.g., "2 hours", "30 minutes", "1 day"
  progress?: number; // 0-100 for in-progress tasks
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export interface SidebarProps {
  projects: Project[];
  activeProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  onToggle?: (isCollapsed: boolean) => void;
}

export interface InputBarProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  sidebarCollapsed?: boolean;
}

// API Request/Response Interfaces
export interface GenerateTasksRequest {
  input: string;
  projectId: string;
}

export interface GenerateTasksResponse {
  success: boolean;
  tasks: Task[];
  error?: string;
}

export interface ExecuteTaskRequest {
  taskId: string;
}

export interface ExecuteTaskResponse {
  success: boolean;
  status: string;
  filePath?: string;
  error?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// Kanban Types
export type KanbanStatus = 'ready' | 'blocked' | 'in_progress' | 'completed';

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  theme: string;
  tasks: Task[];
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  onTaskClick?: (task: Task) => void;
  onTaskExecute?: (task: Task) => void;
}