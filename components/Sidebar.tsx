import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare } from "lucide-react";
import { SidebarProps } from "@/lib/types";

export function Sidebar({ projects, activeProjectId, onProjectSelect, onNewProject }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#202123] flex flex-col">
      <div className="p-4">
        <Button
          onClick={onNewProject}
          className="w-full justify-start gap-2 bg-transparent border border-gray-600 hover:bg-gray-700 text-white text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Button>
      </div>
      
      <div className="flex-1 px-3 pb-3 overflow-y-auto">
        <div className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 text-sm ${
                activeProjectId === project.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configuración</span>
        </div>
      </div>
    </div>
  );
}