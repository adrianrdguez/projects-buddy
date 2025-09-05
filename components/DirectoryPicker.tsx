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
      
      // Use the File System Access API (modern browsers)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const path = dirHandle.name; // This will be just the folder name
        setSelectedPath(path);
        onPathSelect(path);
      } else {
        // Fallback for browsers that don't support File System Access API
        // Create a hidden input element for directory selection
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        
        input.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            // Extract the common directory path from the first file
            const fullPath = files[0].webkitRelativePath;
            const dirPath = fullPath.split('/')[0];
            setSelectedPath(dirPath);
            onPathSelect(dirPath);
          }
        };
        
        input.click();
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      // User cancelled or error occurred
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