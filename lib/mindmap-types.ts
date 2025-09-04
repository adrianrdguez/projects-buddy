import { Task } from './types';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Connection {
  from: string;
  to: string;
  type: 'dependency' | 'hierarchy';
}

export type CardType = 'root' | 'branch' | 'task';

export interface MindMapCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  position: Position;
  size: Size;
  parentId?: string;
  children: string[];
  status: 'ready' | 'blocked' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  progress?: number;
  dependencies?: string[];
  visible: boolean;
}

export interface MindMapData {
  cards: Record<string, MindMapCard>;
  connections: Connection[];
  rootId: string;
  projectName: string;
}

export interface MindMapCanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskExecute?: (task: Task) => void;
  isLoading?: boolean;
}