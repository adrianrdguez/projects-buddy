import { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LoadingText } from "@/components/ui/LoadingText";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { MindMapData, MindMapCard } from "@/lib/mindmap-types";
import { 
  tasksToMindMapData, 
  positionCards, 
  toggleChildrenVisibility,
  getBranchStats 
} from "@/lib/mindmap-utils";
import { useZoom } from "@/hooks/useZoom";
import { RootCard } from "./RootCard";
import { BranchCard } from "./BranchCard";
import { MindMapTaskCard } from "./MindMapTaskCard";
import { ConnectionLines } from "./ConnectionLines";
import { ZoomControls } from "./ZoomControls";

interface MindMapCanvasProps {
  projectName: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskExecute?: (task: Task) => void;
  onProjectNameChange?: (newName: string) => void;
  isLoading?: boolean;
}

export function MindMapCanvas({ 
  projectName, 
  tasks, 
  onTaskClick, 
  onTaskExecute, 
  onProjectNameChange,
  isLoading = false 
}: MindMapCanvasProps) {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1400, height: 1200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(projectName);
  const [isExecutionAnimating, setIsExecutionAnimating] = useState(false);
  const [animatedConnections, setAnimatedConnections] = useState<string[]>([]);
  const [processingConnections, setProcessingConnections] = useState<string[]>([]);
  const [processingCards, setProcessingCards] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const mindMapDataRef = useRef<MindMapData | null>(null);
  
  const { zoomState, zoomIn, zoomOut, resetZoom, pan, getTransform } = useZoom(0.8);

  // Update edit value when project name changes
  useEffect(() => {
    setEditNameValue(projectName);
  }, [projectName]);

  const handleStartEdit = () => {
    setIsEditingName(true);
    setEditNameValue(projectName);
    // Focus input after state update
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.select();
      }
    }, 0);
  };

  const handleSaveName = () => {
    const newName = editNameValue.trim();
    if (newName && newName !== projectName && onProjectNameChange) {
      onProjectNameChange(newName);
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditNameValue(projectName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(rect.width, 1200),
          height: Math.max(rect.height, 800),
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Convert tasks to mind map data when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      // Calculate needed canvas height based on tree structure
      const data = tasksToMindMapData(tasks, projectName);
      const branches = Object.values(data.cards).filter(card => card.type === 'branch');
      const maxTasksInBranch = Math.max(...branches.map(branch => branch.children.length));
      const estimatedHeight = Math.max(1200, 600 + maxTasksInBranch * 200);
      
      const adaptedCanvasSize = { ...canvasSize, height: estimatedHeight };
      const positionedData = positionCards(data, adaptedCanvasSize);
      setMindMapData(positionedData);
      mindMapDataRef.current = positionedData;
      setCanvasSize(adaptedCanvasSize);
    } else {
      setMindMapData(null);
      mindMapDataRef.current = null;
    }
  }, [tasks, projectName]);

  const handleRootRegenerate = () => {
    // Trigger project regeneration (you can emit an event or call a prop)
    console.log('Regenerating project...');
  };

  const collapseAllBranches = (data: MindMapData): MindMapData => {
    const updatedCards = { ...data.cards };
    
    // Hide all task cards (keep only root and branch cards visible)
    Object.keys(updatedCards).forEach(cardId => {
      const card = updatedCards[cardId];
      if (card.type === 'task') {
        updatedCards[cardId] = { ...card, visible: false };
      }
    });
    
    return { ...data, cards: updatedCards };
  };

  const handleStartExecution = () => {
    if (!mindMapData || isExecutionAnimating) return;

    setIsExecutionAnimating(true);
    setAnimatedConnections([]);
    setProcessingConnections([]);
    setProcessingCards([]);

    // First collapse all branches to ensure they start collapsed
    const collapsedData = collapseAllBranches(mindMapData);
    setMindMapData(collapsedData);
    mindMapDataRef.current = collapsedData;

    // Find the first task to execute (one with no dependencies or all dependencies completed)
    const readyTasks = tasks.filter(task => {
      if (!task.dependencies || task.dependencies.length === 0) return true;
      return task.dependencies.every(depId => 
        tasks.some(t => t.id === depId && t.status === 'completed')
      );
    });

    if (readyTasks.length === 0) {
      setIsExecutionAnimating(false);
      return;
    }

    const firstTask = readyTasks[0];

    // Find the path from root to the first task
    const pathToFirstTask = findPathToTask(collapsedData, firstTask.id);
    
    // Small delay to let the collapse happen, then start animation
    setTimeout(() => {
      animatePathConnections(pathToFirstTask, firstTask.id);
    }, 100);
  };

  const findPathToTask = (data: MindMapData, taskId: string): string[] => {
    const connections: string[] = [];
    const taskCard = data.cards[taskId];
    
    if (!taskCard || !taskCard.parentId) return connections;
    
    // Find branch card
    const branchCard = data.cards[taskCard.parentId];
    
    if (branchCard && branchCard.parentId) {
      // Connection from root to branch
      const rootToBranch = `${branchCard.parentId}->${branchCard.id}`;
      connections.push(rootToBranch);
      
      // Connection from branch to task
      const branchToTask = `${branchCard.id}->${taskId}`;
      connections.push(branchToTask);
    }
    
    return connections;
  };

  const animatePathConnections = (connectionIds: string[], taskId: string) => {
    let delay = 0;
    
    connectionIds.forEach((connectionId, index) => {
      setTimeout(() => {
        setAnimatedConnections(prev => [...prev, connectionId]);
        
        // After 3 trips (3 seconds), stop particle animation and start processing state
        setTimeout(() => {
          setAnimatedConnections(prev => prev.filter(id => id !== connectionId));
          setProcessingConnections(prev => [...prev, connectionId]);
          
          // If this is the first connection (root to branch), expand the branch
          if (index === 0) {
            const currentData = mindMapDataRef.current;
            if (currentData) {
              const taskCard = currentData.cards[taskId];
              if (taskCard && taskCard.parentId) {
                // Add branch card to processing state
                setProcessingCards(prev => [...prev, taskCard.parentId]);
                
                const updatedData = toggleChildrenVisibility(currentData, taskCard.parentId);
                setMindMapData(updatedData);
                mindMapDataRef.current = updatedData;
              }
            }
          }
          
          // If this is the last connection, add the final task to processing
          if (index === connectionIds.length - 1) {
            setProcessingCards(prev => [...prev, taskId]);
          }
        }, 3000); // Wait for 3 trips to complete
        
        // Reset all processing states after 7 seconds of glow effect
        if (index === connectionIds.length - 1) {
          setTimeout(() => {
            setIsExecutionAnimating(false);
            setAnimatedConnections([]);
            setProcessingConnections([]);
            setProcessingCards([]);
          }, 10000); // 3s for particles + 7s for glow effect
        }
      }, delay);
      delay += index === 0 ? 4000 : 4000; // 4 seconds between each connection phase
    });
  };

  const handleCardClick = (card: MindMapCard) => {
    if (card.type === 'task' && onTaskClick) {
      const task = tasks.find(t => t.id === card.id);
      if (task) {
        onTaskClick(task);
      }
    }
  };

  const handleTaskExecute = (card: MindMapCard) => {
    if (onTaskExecute) {
      const task = tasks.find(t => t.id === card.id);
      if (task) {
        onTaskExecute(task);
      }
    }
  };

  const handleToggleChildren = (cardId: string) => {
    if (mindMapData) {
      const updatedData = toggleChildrenVisibility(mindMapData, cardId);
      setMindMapData(updatedData);
      mindMapDataRef.current = updatedData;
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.2, Math.min(zoomState.scale + delta, 3));
    
    if (newScale !== zoomState.scale) {
      if (delta > 0) zoomIn();
      else zoomOut();
    }
  }, [zoomState.scale, zoomIn, zoomOut]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !(e.target as Element).closest('.mind-map-card')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      pan(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart, pan]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderCard = (card: MindMapCard) => {
    if (!card.visible && card.type !== 'root') {
      return null;
    }

    const isProcessing = processingCards.includes(card.id);

    switch (card.type) {
      case 'root':
        return (
          <RootCard
            key={card.id}
            card={card}
            onRegenerate={handleRootRegenerate}
            onClick={handleCardClick}
            onStartExecution={handleStartExecution}
          />
        );
      case 'branch':
        const stats = getBranchStats(card.id, mindMapData!.cards);
        const childrenVisible = card.children.some(childId => 
          mindMapData!.cards[childId]?.visible
        );
        
        return (
          <BranchCard
            key={card.id}
            card={card}
            taskCount={stats.taskCount}
            completedTasks={stats.completedTasks}
            onClick={handleCardClick}
            onToggleChildren={handleToggleChildren}
            childrenVisible={childrenVisible}
            isProcessing={isProcessing}
          />
        );
      case 'task':
        return (
          <MindMapTaskCard
            key={card.id}
            card={card}
            onClick={handleCardClick}
            onExecute={handleTaskExecute}
            isProcessing={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 sticky top-0 z-10 bg-background">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-2xl font-medium text-foreground bg-transparent border-b-2 border-primary outline-none text-center px-2 py-1"
                    maxLength={100}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveName}
                    className="w-8 h-8 p-0 rounded-full hover:bg-accent text-green-600"
                    title="Guardar nombre"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="w-8 h-8 p-0 rounded-full hover:bg-accent text-red-600"
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-2xl font-medium text-foreground">
                    {projectName}
                  </h2>
                  {onProjectNameChange && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEdit}
                      className="w-8 h-8 p-0 rounded-full hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Editar nombre del proyecto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {isLoading ? "Generando tareas con IA..." : "Mapa mental del proyecto"}
            </p>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div 
          className="flex-1 relative overflow-hidden" 
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="xl" className="text-primary mb-6" />
              <LoadingText className="text-muted-foreground text-base mb-3" />
              <p className="text-muted-foreground text-xs opacity-70">Esto puede tomar unos momentos</p>
            </div>
          ) : mindMapData ? (
            <div 
              className="relative"
              style={{ 
                width: canvasSize.width, 
                height: canvasSize.height,
                transform: getTransform(),
                transformOrigin: 'top left',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              ref={canvasRef}
            >
              {/* Connection Lines */}
              <ConnectionLines
                cards={mindMapData.cards}
                connections={mindMapData.connections}
                canvasSize={canvasSize}
                animatedConnections={animatedConnections}
                processingConnections={processingConnections}
              />
              
              {/* Cards */}
              <div className="relative z-10">
                {Object.values(mindMapData.cards).map((card) => (
                  <div key={card.id} className="mind-map-card">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay tareas aún
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Usa la barra de entrada de abajo para describir lo que quieres hacer. La IA generará tareas automáticamente organizadas en un mapa mental y nombrará el proyecto según tu descripción.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        {mindMapData && !isLoading && (
          <ZoomControls
            scale={zoomState.scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />
        )}
      </div>
    </div>
  );
}