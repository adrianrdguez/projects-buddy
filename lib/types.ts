export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tech_stack: string[]; // Array of technologies like ["Next.js", "Supabase", "Stripe"]
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  project_id: string; // Changed from projectId to match DB
  title: string;
  description: string;
  status: 'ready' | 'blocked' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dependencies: string[]; // Array of task IDs that must be completed first
  estimatedTime: string; // e.g., "2 hours", "30 minutes", "1 day"
  target_file?: string; // File path where code will be generated
  ai_prompt?: string; // Original user prompt that generated this task
  generated_prompt?: string; // Optimized prompt for Claude Code
  progress?: number; // 0-100 for in-progress tasks
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskExecution {
  id: string;
  task_id: string;
  status: 'pending' | 'success' | 'error';
  output?: string; // Response from Claude Code server
  file_path?: string; // Path where code was generated
  cursor_opened: boolean;
  error_message?: string;
  executed_at: Date;
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
  projectName?: string;
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
  tech_stack?: string[];
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