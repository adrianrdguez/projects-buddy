"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Check, X } from "lucide-react";

interface DirectoryPickerProps {
  value?: string;
  onPathSelect: (path: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function DirectoryPicker({ 
  value, 
  onPathSelect, 
  onCancel,
  placeholder = "Seleccionar directorio del proyecto..." 
}: DirectoryPickerProps) {
  const [selectedPath, setSelectedPath] = useState<string>(value || "");
  const [isSelecting, setIsSelecting] = useState(false);

  const handleDirectorySelect = async () => {
    try {
      setIsSelecting(true);
      
      // For now, let's use a simple prompt to get the full path
      // This is a temporary solution until we implement a better directory picker
      const userPath = prompt(
        'Enter the full path to your project directory:\n\n' +
        'Examples:\n' +
        '• /Users/yourname/Projects/my-project\n' +
        '• /home/user/workspace/project\n' +
        '• C:\\Users\\YourName\\Projects\\MyProject\n\n' +
        'Path:'
      );
      
      if (userPath && userPath.trim()) {
        const cleanPath = userPath.trim();
        setSelectedPath(cleanPath);
        onPathSelect(cleanPath);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPath) {
      onPathSelect(selectedPath);
    }
  };

  const handleClear = () => {
    setSelectedPath("");
    onPathSelect("");
  };

  return (
    <Card className="border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Directorio del Proyecto</span>
          </div>
          
          {selectedPath ? (
            <div className="w-full max-w-md">
              <div className="flex items-center space-x-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium truncate flex-1">
                  {selectedPath}
                </span>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleConfirm}
                    className="h-6 w-6 p-0 hover:bg-primary/20"
                  >
                    <Check className="w-3 h-3 text-primary" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClear}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona el directorio donde se encuentran los archivos de tu proyecto
              </p>
              <Button
                onClick={handleDirectorySelect}
                disabled={isSelecting}
                variant="outline"
                className="w-full"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {isSelecting ? "Seleccionando..." : "Seleccionar Directorio"}
              </Button>
            </div>
          )}
          
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}