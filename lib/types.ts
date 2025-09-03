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