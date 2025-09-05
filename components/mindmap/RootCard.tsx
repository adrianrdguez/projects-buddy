import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MindMapCard } from "@/lib/mindmap-types";
import { RefreshCw, Settings, Play } from "lucide-react";

interface RootCardProps {
  card: MindMapCard;
  onRegenerate?: () => void;
  onClick?: (card: MindMapCard) => void;
  onStartExecution?: () => void;
  onConfigureProject?: () => void;
}

export function RootCard({ card, onRegenerate, onClick, onStartExecution, onConfigureProject }: RootCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRegenerate) {
      onRegenerate();
    }
  };

  const handleStartExecution = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartExecution) {
      onStartExecution();
    }
  };

  const handleConfigureProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigureProject) {
      onConfigureProject();
    }
  };

  return (
    <Card 
      className="bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50"
      style={{
        position: 'absolute',
        left: card.position.x - card.size.width / 2,
        top: card.position.y - card.size.height / 2,
        width: card.size.width,
        height: card.size.height,
      }}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-foreground leading-tight">
            {card.title}
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title="Regenerar proyecto"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={handleConfigureProject}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title="Configurar directorio del proyecto"
            >
              <Settings className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {card.description}
        </p>
        
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Proyecto Principal</span>
            </div>
          </div>
          <div className="text-primary font-medium">
            {card.children.length} fases
          </div>
        </div>

        <Button 
          onClick={handleStartExecution}
          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          size="default"
        >
          <Play className="w-4 h-4 mr-2" />
          Comenzar Ejecución
        </Button>
      </CardContent>
    </Card>
  );
}