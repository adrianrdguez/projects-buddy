import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Sun, Moon } from "lucide-react";
import { SidebarProps } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

export function Sidebar({ projects, activeProjectId, onProjectSelect, onNewProject }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="w-64 h-screen bg-muted flex flex-col border-r">
      <div className="p-4 flex items-center gap-2">
        <Button
          onClick={onNewProject}
          className="w-full justify-start gap-2 bg-card border border-border hover:bg-accent text-foreground text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          className="ml-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
      
      <div className="flex-1 px-3 pb-3 overflow-y-auto">
        <div className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 text-sm border ${
                activeProjectId === project.id
                  ? "bg-card text-foreground border-border shadow-sm"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-3 py-2 text-foreground/70 hover:bg-accent rounded-lg cursor-pointer transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configuración</span>
        </div>
      </div>
    </div>
  );
}