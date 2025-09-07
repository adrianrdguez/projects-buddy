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
    size: { width: 320, height: 220 },
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
      size: { width: 220, height: 140 },
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
        size: { width: 200, height: 130 },
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

// Position cards using vertical tree layout algorithm
export function positionCards(data: MindMapData, canvasSize: { width: number; height: number }): MindMapData {
  const { cards } = data;
  const centerX = canvasSize.width / 2;
  const rootY = 150; // Position root near the top
  
  // Position root card at top center
  const rootCard = cards[data.rootId];
  rootCard.position = { x: centerX, y: rootY };

  // Position branch cards horizontally below root
  const branches = rootCard.children.map(id => cards[id]).filter(Boolean);
  const branchY = rootY + 300; // Distance below root
  const branchSpacing = Math.min(400, (canvasSize.width - 200) / Math.max(branches.length, 1));
  
  // Calculate starting X position to center all branches
  const totalBranchWidth = (branches.length - 1) * branchSpacing;
  const startX = centerX - totalBranchWidth / 2;

  branches.forEach((branch, index) => {
    branch.position = {
      x: startX + (index * branchSpacing),
      y: branchY,
    };

    // Position task cards vertically below each branch
    const taskCards = branch.children.map(id => cards[id]).filter(Boolean);
    const taskSpacing = 140; // Vertical spacing between tasks
    const taskStartY = branchY + 200; // Distance below branch
    
    // For multiple tasks, arrange them in a grid pattern below the branch
    const tasksPerRow = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(taskCards.length))));
    const taskRowSpacing = 180;
    const taskColSpacing = 200;
    
    taskCards.forEach((task, taskIndex) => {
      const row = Math.floor(taskIndex / tasksPerRow);
      const col = taskIndex % tasksPerRow;
      
      // Center tasks within each row
      const rowWidth = (Math.min(taskCards.length - row * tasksPerRow, tasksPerRow) - 1) * taskColSpacing;
      const rowStartX = branch.position.x - rowWidth / 2;
      
      task.position = {
        x: rowStartX + (col * taskColSpacing),
        y: taskStartY + (row * taskRowSpacing),
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