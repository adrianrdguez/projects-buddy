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
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
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
}

export interface InputBarProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
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