import { Task } from './types';
import { MindMapCard, MindMapData, Position, Connection } from './mindmap-types';

// Convert tasks to mind map data structure
export function tasksToMindMapData(tasks: Task[], projectName: string): MindMapData {
  const cards: Record<string, MindMapCard> = {};
  const connections: Connection[] = [];

  // Create root card
  const rootId = 'root';
  const rootCard: MindMapCard = {
    id: rootId,
    type: 'root',
    title: projectName,
    description: `Proyecto principal con ${tasks.length} tareas organizadas en fases`,
    position: { x: 0, y: 0 }, // Will be positioned at center
    size: { width: 300, height: 200 },
    children: [],
    status: 'ready',
    visible: true,
  };

  // Group tasks by category/phase
  const tasksByCategory = groupTasksByCategory(tasks);
  const categories = Object.keys(tasksByCategory);

  // Create branch cards for each category
  categories.forEach((category, index) => {
    const branchId = `branch-${index}`;
    const categoryTasks = tasksByCategory[category];
    
    const branchCard: MindMapCard = {
      id: branchId,
      type: 'branch',
      title: category,
      description: `${categoryTasks.length} tareas en esta fase`,
      position: { x: 0, y: 0 }, // Will be positioned around root
      size: { width: 200, height: 120 },
      parentId: rootId,
      children: [],
      status: getBranchStatus(categoryTasks),
      visible: true,
    };

    cards[branchId] = branchCard;
    rootCard.children.push(branchId);

    // Create hierarchical connection from root to branch
    connections.push({
      from: rootId,
      to: branchId,
      type: 'hierarchy'
    });

    // Create task cards for this branch
    categoryTasks.forEach((task, taskIndex) => {
      const taskCard: MindMapCard = {
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        position: { x: 0, y: 0 }, // Will be positioned near branch
        size: { width: 180, height: 100 },
        parentId: branchId,
        children: [],
        status: task.status,
        priority: task.priority,
        estimatedTime: task.estimatedTime,
        progress: task.progress,
        dependencies: task.dependencies,
        visible: false, // Initially hidden
      };

      cards[task.id] = taskCard;
      branchCard.children.push(task.id);

      // Create hierarchical connection from branch to task
      connections.push({
        from: branchId,
        to: task.id,
        type: 'hierarchy'
      });

      // Create dependency connections
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (cards[depId] || tasks.some(t => t.id === depId)) {
            connections.push({
              from: depId,
              to: task.id,
              type: 'dependency'
            });
          }
        });
      }
    });
  });

  cards[rootId] = rootCard;

  return {
    cards,
    connections,
    rootId,
    projectName,
  };
}

// Group tasks by category (you can customize this logic)
function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  const categories: Record<string, Task[]> = {};

  tasks.forEach(task => {
    // Simple categorization based on task title keywords
    let category = 'General';
    
    const title = task.title.toLowerCase();
    if (title.includes('setup') || title.includes('config') || title.includes('install')) {
      category = 'Setup';
    } else if (title.includes('frontend') || title.includes('ui') || title.includes('component')) {
      category = 'Frontend';
    } else if (title.includes('backend') || title.includes('api') || title.includes('server')) {
      category = 'Backend';
    } else if (title.includes('database') || title.includes('db') || title.includes('model')) {
      category = 'Database';
    } else if (title.includes('test') || title.includes('testing')) {
      category = 'Testing';
    } else if (title.includes('deploy') || title.includes('build') || title.includes('production')) {
      category = 'Deployment';
    }

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(task);
  });

  return categories;
}

// Determine branch status based on its tasks
function getBranchStatus(tasks: Task[]): 'ready' | 'blocked' | 'in_progress' | 'completed' {
  if (tasks.length === 0) return 'ready';
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  
  if (completedTasks === tasks.length) return 'completed';
  if (inProgressTasks > 0) return 'in_progress';
  if (blockedTasks > 0) return 'blocked';
  return 'ready';
}

// Position cards using radial layout algorithm
export function positionCards(data: MindMapData, canvasSize: { width: number; height: number }): MindMapData {
  const { cards } = data;
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  // Position root card at center
  const rootCard = cards[data.rootId];
  rootCard.position = { x: centerX, y: centerY };

  // Position branch cards in a circle around root
  const branches = rootCard.children.map(id => cards[id]).filter(Boolean);
  const branchRadius = Math.min(canvasSize.width, canvasSize.height) * 0.3;

  branches.forEach((branch, index) => {
    const angle = (index * 2 * Math.PI) / branches.length - Math.PI / 2;
    branch.position = {
      x: centerX + Math.cos(angle) * branchRadius,
      y: centerY + Math.sin(angle) * branchRadius,
    };

    // Position task cards around their parent branch
    const taskCards = branch.children.map(id => cards[id]).filter(Boolean);
    const taskRadius = 150;
    
    taskCards.forEach((task, taskIndex) => {
      const taskAngle = (taskIndex * 2 * Math.PI) / Math.max(taskCards.length, 1);
      task.position = {
        x: branch.position.x + Math.cos(taskAngle) * taskRadius,
        y: branch.position.y + Math.sin(taskAngle) * taskRadius,
      };
    });
  });

  return { ...data, cards };
}

// Toggle visibility of child cards
export function toggleChildrenVisibility(data: MindMapData, parentId: string): MindMapData {
  const cards = { ...data.cards };
  const parent = cards[parentId];
  
  if (!parent) return data;

  const newVisibility = !parent.children.some(childId => cards[childId]?.visible);
  
  parent.children.forEach(childId => {
    if (cards[childId]) {
      cards[childId].visible = newVisibility;
      
      // If hiding, also hide grandchildren
      if (!newVisibility) {
        cards[childId].children.forEach(grandchildId => {
          if (cards[grandchildId]) {
            cards[grandchildId].visible = false;
          }
        });
      }
    }
  });

  return { ...data, cards };
}

// Get task statistics for a branch
export function getBranchStats(branchId: string, cards: Record<string, MindMapCard>) {
  const branch = cards[branchId];
  if (!branch) return { taskCount: 0, completedTasks: 0 };

  const tasks = branch.children.map(id => cards[id]).filter(Boolean);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return {
    taskCount: tasks.length,
    completedTasks,
  };
}