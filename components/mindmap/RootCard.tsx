import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MindMapCard } from "@/lib/mindmap-types";
import { RefreshCw, Settings } from "lucide-react";

interface RootCardProps {
  card: MindMapCard;
  onRegenerate?: () => void;
  onClick?: (card: MindMapCard) => void;
}

export function RootCard({ card, onRegenerate, onClick }: RootCardProps) {
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
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title="Configuración"
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
        
        <div className="flex items-center justify-between text-xs">
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
      </CardContent>
    </Card>
  );
}