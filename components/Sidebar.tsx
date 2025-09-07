import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Trash2, LogOut, ChevronUp } from "lucide-react";
import { SidebarProps } from "@/lib/types";

export function Sidebar({ projects, activeProjectId, onProjectSelect, onNewProject, onDeleteProject, onToggle, user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent project selection when clicking delete
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmed && onDeleteProject) {
      onDeleteProject(projectId);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (confirmed && onLogout) {
      onLogout();
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getAvatarFallback = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className={`${isCollapsed ? 'w-12' : 'w-64'} h-screen bg-[#F8F5F0] flex flex-col border-r transition-all duration-300 overflow-hidden relative`}>
        {/* Resize handle - only visible when collapsed */}
        {isCollapsed && (
          <div 
            className="absolute top-0 -right-1 w-2 h-full cursor-col-resize hover:bg-primary/10 transition-colors duration-200 z-20"
            onClick={toggleSidebar}
            title="Hacer clic para expandir"
          />
        )}
        {/* App Header - Always visible with consistent logo position */}
        <div className={`${isCollapsed ? 'flex justify-center pl-2' : 'pr-4'} ${isCollapsed ? 'pt-6 pb-2' : 'px-4 pt-6 pb-4'}`}>
          <div className="flex items-center gap-2 w-full">
            {isCollapsed ? (
              /* Collapsed state - icon transforms to expand button on hover */
              <div 
                className="relative w-8 h-8 group cursor-pointer"
                onClick={toggleSidebar}
                title="Expandir sidebar"
              >
                {/* Default app icon */}
                <div className="absolute inset-0 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm transition-all duration-200 group-hover:opacity-0">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                {/* Expand button that replaces icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center w-8 h-8 bg-accent rounded-lg shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-accent/80">
                  <PanelLeftOpen className="w-4 h-4 text-foreground" />
                </div>
              </div>
            ) : (
              /* Expanded state - show logo, text and collapse button */
              <>
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
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
              </>
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
              <div
                key={project.id}
                className={`w-full rounded-xl transition-all duration-300 flex items-center text-sm border group ${
                  activeProjectId === project.id
                    ? "bg-card text-foreground border-border shadow-sm"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground border-transparent"
                } ${isCollapsed ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}
                style={{ transitionDelay: isCollapsed ? '0ms' : `${index * 20}ms` }}
              >
                <button
                  onClick={() => onProjectSelect(project.id)}
                  className="flex-1 text-left p-3 flex items-center gap-3 min-w-0"
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap flex-1 min-w-0">{project.name}</span>
                </button>
                <div className="flex-shrink-0 px-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    className="w-8 h-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title={`Eliminar proyecto "${project.name}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for collapsed state */}
        {isCollapsed && <div className="flex-1" />}
        
        {/* User Profile Section */}
        <div className={`border-t border-border/50 py-3 ${isCollapsed ? 'flex justify-center' : 'px-3'}`}>
          {isCollapsed ? (
            /* User Avatar - Collapsed */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title={getUserDisplayName()}
                >
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    getAvatarFallback()
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    {user?.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* User Profile - Expanded */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer group w-full focus:outline-none focus:bg-accent"
                  title="Abrir menú de usuario"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={getUserDisplayName()}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      getAvatarFallback()
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getUserDisplayName()}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" className="w-56" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    {user?.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </>
  );
}