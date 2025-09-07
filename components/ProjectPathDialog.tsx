"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DirectoryPicker } from "./DirectoryPicker";
import { Project } from "@/lib/types";

interface ProjectPathDialogProps {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (projectPath: string) => void;
  isLoading?: boolean;
}

export function ProjectPathDialog({ 
  project, 
  open, 
  onOpenChange, 
  onSave, 
  isLoading = false 
}: ProjectPathDialogProps) {
  const [selectedPath, setSelectedPath] = useState<string>(project?.projectPath || "");

  const handleSave = () => {
    onSave(selectedPath);
  };

  const handlePathSelect = (path: string) => {
    setSelectedPath(path);
  };

  const hasPath = selectedPath && selectedPath.trim().length > 0;
  const isEditing = !!project?.projectPath;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Cambiar Directorio del Proyecto" : "Configurar Directorio del Proyecto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Selecciona un nuevo directorio para "${project?.name}"`
              : `Selecciona el directorio donde se encuentra tu proyecto "${project?.name}" para que las tareas se ejecuten en la ubicación correcta.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DirectoryPicker
            value={selectedPath}
            onPathSelect={handlePathSelect}
            placeholder="Seleccionar directorio del proyecto..."
          />
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasPath || isLoading}
            className="mb-2 sm:mb-0"
          >
            {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}