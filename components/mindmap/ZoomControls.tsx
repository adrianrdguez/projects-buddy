import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-20 right-6 z-20 flex flex-col gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
      <Button
        size="sm"
        variant="outline"
        onClick={onZoomIn}
        className="w-10 h-10 p-0 hover:bg-primary/10"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      
      <div className="text-xs text-center text-muted-foreground px-1 py-1 min-w-[2.5rem]">
        {Math.round(scale * 100)}%
      </div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onZoomOut}
        className="w-10 h-10 p-0 hover:bg-primary/10"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <div className="border-t border-border my-1"></div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onResetZoom}
        className="w-10 h-10 p-0 hover:bg-primary/10"
        title="Reset Zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}