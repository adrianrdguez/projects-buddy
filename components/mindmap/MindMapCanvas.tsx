import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Task } from "@/lib/types";
import { MindMapData, MindMapCard } from "@/lib/mindmap-types";
import { 
  tasksToMindMapData, 
  positionCards, 
  toggleChildrenVisibility,
  getBranchStats 
} from "@/lib/mindmap-utils";
import { RootCard } from "./RootCard";
import { BranchCard } from "./BranchCard";
import { MindMapTaskCard } from "./MindMapTaskCard";
import { ConnectionLines } from "./ConnectionLines";

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
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const canvasRef = useRef<HTMLDivElement>(null);

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
      const data = tasksToMindMapData(tasks, projectName);
      const positionedData = positionCards(data, canvasSize);
      setMindMapData(positionedData);
    } else {
      setMindMapData(null);
    }
  }, [tasks, projectName, canvasSize]);

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
        <div className="flex-1 relative overflow-auto" ref={canvasRef}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-foreground animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Procesando tu solicitud...</p>
            </div>
          ) : mindMapData ? (
            <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
              {/* Connection Lines */}
              <ConnectionLines
                cards={mindMapData.cards}
                connections={mindMapData.connections}
                canvasSize={canvasSize}
              />
              
              {/* Cards */}
              <div className="relative z-10">
                {Object.values(mindMapData.cards).map(renderCard)}
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
                  Usa la barra de entrada de abajo para describir lo que quieres hacer y la IA generará tareas automáticamente organizadas en un mapa mental.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}