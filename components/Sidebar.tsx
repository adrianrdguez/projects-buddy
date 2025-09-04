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
      <div className={`${isCollapsed ? 'w-12' : 'w-64'} h-screen bg-[#F8F5F0] flex flex-col border-r transition-all duration-300 overflow-hidden relative`}>
        {/* App Header - Always visible with consistent logo position */}
        <div className={`${isCollapsed ? 'flex justify-center pl-2' : 'pr-4'} ${isCollapsed ? 'pt-6 pb-2' : 'px-4 pt-6 pb-4'}`}>
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            {isCollapsed ? (
              /* Collapsed state - show toggle button below logo */
              <div className="absolute top-20 left-2">
                <Button
                  onClick={toggleSidebar}
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-lg hover:bg-accent"
                  title="Expandir sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Expanded state - show text and toggle button */
              <div className={`overflow-hidden transition-all duration-300 w-full opacity-100 translate-x-0`}>
                <div className="flex items-center justify-between w-full">
                  <div className="whitespace-nowrap">
                    <h1 className="text-xl font-bold text-foreground">Taskana</h1>
                    <p className="text-xs text-muted-foreground">Project Organizer</p>
                  </div>
                  <Button
                    onClick={toggleSidebar}
                    size="sm"
                    variant="ghost"
                    className="ml-2 rounded-lg hover:bg-accent flex-shrink-0"
                    title="Colapsar sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Project Button */}
        <div className={`${isCollapsed ? 'flex justify-center py-2' : 'px-4 pb-4'}`}>
          <Button
            onClick={onNewProject}
            className={`${isCollapsed 
              ? 'w-8 h-8 p-0 bg-card border border-border hover:bg-accent text-foreground rounded-full shadow-sm flex items-center justify-center'
              : 'w-full justify-start gap-2 bg-card border border-border hover:bg-accent text-foreground text-sm py-2.5 rounded-full overflow-hidden transition-all duration-300 opacity-100 scale-100 translate-x-0'
            }`}
            title={isCollapsed ? "Nuevo proyecto" : undefined}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Nuevo proyecto</span>}
          </Button>
        </div>
        
        {/* Projects List - Only show when expanded */}
        <div className={`flex-1 px-3 pb-3 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
          <div className="space-y-1">
            {projects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-sm border overflow-hidden ${
                  activeProjectId === project.id
                    ? "bg-card text-foreground border-border shadow-sm"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground border-transparent"
                } ${isCollapsed ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}
                style={{ transitionDelay: isCollapsed ? '0ms' : `${index * 20}ms` }}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate whitespace-nowrap">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer for collapsed state */}
        {isCollapsed && <div className="flex-1" />}
        
        {/* Settings Section */}
        <div className={`border-t border-border/50 py-3 ${isCollapsed ? 'flex flex-col items-center gap-2' : 'px-3'}`}>
          {isCollapsed ? (
            <>
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
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 rounded-full hover:bg-accent flex items-center justify-center"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 px-3 py-2 text-foreground/70 hover:bg-accent rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}>
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm whitespace-nowrap">Configuración</span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                className={`rounded-full transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}