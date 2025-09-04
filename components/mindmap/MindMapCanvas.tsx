import { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LoadingText } from "@/components/ui/LoadingText";
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
  isLoading?: boolean;
}

export function MindMapCanvas({ 
  projectName, 
  tasks, 
  onTaskClick, 
  onTaskExecute, 
  isLoading = false 
}: MindMapCanvasProps) {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1400, height: 1200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { zoomState, zoomIn, zoomOut, resetZoom, pan, getTransform } = useZoom(0.8);

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
      setCanvasSize(adaptedCanvasSize);
    } else {
      setMindMapData(null);
    }
  }, [tasks, projectName]);

  const handleRootRegenerate = () => {
    // Trigger project regeneration (you can emit an event or call a prop)
    console.log('Regenerating project...');
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

    switch (card.type) {
      case 'root':
        return (
          <RootCard
            key={card.id}
            card={card}
            onRegenerate={handleRootRegenerate}
            onClick={handleCardClick}
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
          />
        );
      case 'task':
        return (
          <MindMapTaskCard
            key={card.id}
            card={card}
            onClick={handleCardClick}
            onExecute={handleTaskExecute}
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
            <h2 className="text-2xl font-medium text-foreground mb-2">
              {projectName}
            </h2>
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