import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarProps } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

export function Sidebar({ projects, activeProjectId, onProjectSelect, onNewProject, onToggle }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  return (
    <>
      <div className={`${isCollapsed ? 'w-12' : 'w-64'} h-screen bg-[#F8F5F0] flex flex-col border-r transition-all duration-300 overflow-hidden`}>
        {isCollapsed ? (
          /* Collapsed Sidebar */
          <>
            {/* Collapsed Logo */}
            <div className="flex justify-center pt-6 pb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            {/* Collapsed New Project Button (top, below logo) */}
            <div className="flex justify-center pb-3">
              <Button
                onClick={onNewProject}
                size="sm"
                className="w-8 h-8 p-0 bg-card border border-border hover:bg-accent text-foreground rounded-full shadow-sm flex items-center justify-center"
                title="Nuevo proyecto"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1" />

            {/* Collapsed Settings */}
            <div className="border-t border-border/50 py-3 flex justify-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={toggleTheme}
                className="w-8 h-8 p-0 rounded-full hover:bg-accent flex items-center justify-center"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </>
        ) : (
          /* Expanded Sidebar */
          <>
            {/* App Header */}
            <div className="px-4 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Taskana</h1>
                  <p className="text-xs text-muted-foreground">Project Organizer</p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 flex items-center gap-2">
              <Button
                onClick={onNewProject}
                className="w-full justify-start gap-2 bg-card border border-border hover:bg-accent text-foreground text-sm py-2.5 rounded-full"
              >
                <Plus className="w-4 h-4" />
                Nuevo proyecto
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                className="ml-2 rounded-full"
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
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 text-sm border ${
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
          </>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={toggleSidebar}
        size="sm"
        variant="outline"
        className={`fixed top-4 ${isCollapsed ? 'left-14' : 'left-60'} z-50 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border hover:bg-accent shadow-md rounded-lg`}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="w-4 h-4" />
        ) : (
          <PanelLeftClose className="w-4 h-4" />
        )}
      </Button>
    </>
  );
}