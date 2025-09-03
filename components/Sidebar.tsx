import { Button } from "@/components/ui/button";
import { Plus, Settings, Circle } from "lucide-react";
import { SidebarProps } from "@/lib/types";

export function Sidebar({ projects, activeProjectId, onProjectSelect, onNewProject }: SidebarProps) {
  return (
    <div className="w-80 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold text-white">AI Planner</h1>
      </div>
      
      <div className="flex-1 p-4">
        <div className="mb-4">
          <Button
            onClick={onNewProject}
            variant="outline"
            className="w-full justify-start gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
          >
            <Plus className="w-4 h-4" />
            + Nuevo proyecto
          </Button>
        </div>
        
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                activeProjectId === project.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Circle className="w-2 h-2 fill-current" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}