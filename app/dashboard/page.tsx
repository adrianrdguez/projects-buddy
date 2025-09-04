"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";
import { MindMapCanvas } from "@/components/mindmap/MindMapCanvas";
import { InputBar } from "@/components/InputBar";
import { Project, Task, GenerateTasksResponse, ProjectsResponse, ExecuteTaskResponse } from "@/lib/types";
import { makeAuthenticatedRequest } from "@/lib/api";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load projects on component mount (only if authenticated and not already loaded)
  useEffect(() => {
    if (user && !hasLoadedProjects) {
      loadProjects();
    }
  }, [user, hasLoadedProjects]);

  // Set active project when projects are loaded and load its tasks
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  // Load tasks when active project changes
  useEffect(() => {
    if (activeProjectId) {
      loadTasksForProject(activeProjectId);
    } else {
      setTasks([]);
    }
  }, [activeProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await makeAuthenticatedRequest('/api/projects');
      const data: ProjectsResponse = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
        setHasLoadedProjects(true);
        setError(null);
      } else {
        setError(data.error || 'Failed to load projects');
      }
    } catch (err) {
      setError('Network error: Could not load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadTasksForProject = async (projectId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/projects/${projectId}/tasks`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
        setError(null);
      } else {
        setError(data.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Network error: Could not load tasks');
    }
  };

  const generateTasks = async (input: string) => {
    if (!activeProjectId) {
      setError('No project selected');
      return;
    }

    try {
      setIsLoadingTasks(true);
      setError(null);

      // Optimistic user-input task at the top of Ready column
      const now = new Date();
      const optimisticTask: Task = {
        id: `user-input-${now.getTime()}`,
        title: input.length > 80 ? input.slice(0, 80) + '…' : input,
        description: input,
        status: 'ready',
        priority: 'medium',
        project_id: activeProjectId,
        dependencies: [],
        estimatedTime: '1 hora',
        ai_prompt: input,
        createdAt: now,
        updatedAt: now,
      };
      // Show only the user's input as a single card
      setTasks([optimisticTask]);
      
      const response = await makeAuthenticatedRequest('/api/generate-tasks', {
        method: 'POST',
        body: JSON.stringify({
          input,
          projectId: activeProjectId
        })
      });

      const data: GenerateTasksResponse = await response.json();
      
      if (data.success) {
        // Update project name if AI generated one
        if (data.projectName && activeProjectId) {
          setProjects(prev => prev.map(project => 
            project.id === activeProjectId 
              ? { ...project, name: data.projectName! }
              : project
          ));
        }
        
        // Reload tasks for the current project to show the generated tasks
        await loadTasksForProject(activeProjectId);
        setError(null);
      } else {
        setError(data.error || 'Failed to generate tasks');
      }
    } catch (err) {
      setError('Network error: Could not generate tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const createNewProject = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Proyecto Sin Título',
          description: ''
        })
      });

      const data: ProjectsResponse = await response.json();
      
      if (data.success && data.projects.length > 0) {
        const newProject = data.projects[0];
        setProjects(prev => [newProject, ...prev]);
        setActiveProjectId(newProject.id);
        setTasks([]); // Clear tasks for new project
        setError(null);
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Network error: Could not create project');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks; // Tasks are already filtered by project in loadTasksForProject

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    // Tasks will be loaded automatically via useEffect
    setError(null);
  };

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed);
  };

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
  };

  const handleTaskExecute = async (task: Task) => {
    try {
      // Update task status to in_progress
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? { ...t, status: 'in_progress' as const, progress: 0 }
            : t
        )
      );

      const response = await makeAuthenticatedRequest('/api/execute-task', {
        method: 'POST',
        body: JSON.stringify({
          taskId: task.id
        })
      });

      const data: ExecuteTaskResponse = await response.json();
      
      if (data.success) {
        // Simulate progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Mark task as completed
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id 
                  ? { ...t, status: 'completed' as const, progress: 100 }
                  : t
              )
            );
          } else {
            // Update progress
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id 
                  ? { ...t, progress }
                  : t
              )
            );
          }
        }, 1000);
        
      } else {
        // Reset task status on failure
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? { ...t, status: 'ready' as const, progress: undefined }
              : t
          )
        );
        setError(data.error || 'Failed to execute task');
      }
    } catch (err) {
      // Reset task status on error
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? { ...t, status: 'ready' as const, progress: undefined }
            : t
        )
      );
      setError('Network error: Could not execute task');
    }
  };

  const handleProjectNameChange = async (newName: string) => {
    if (!activeProjectId) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/projects/${activeProjectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: newName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update project name in local state
        setProjects(prev => prev.map(project => 
          project.id === activeProjectId 
            ? { ...project, name: newName }
            : project
        ));
        setError(null);
      } else {
        setError(data.error || 'Failed to update project name');
      }
    } catch (err) {
      setError('Network error: Could not update project name');
    }
  };

  // Show loading only on initial load, not when switching tabs
  if (loading || (isLoadingProjects && !hasLoadedProjects)) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4 mx-auto"></div>
          <p>{loading ? 'Verificando autenticación...' : 'Cargando proyectos...'}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (user will be redirected)
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId || undefined}
        onProjectSelect={handleProjectSelect}
        onNewProject={createNewProject}
        onToggle={handleSidebarToggle}
      />
      
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-12' : 'ml-0'}`}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error</div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
        
        <MindMapCanvas
          projectName={activeProject?.name || "Selecciona un proyecto"}
          tasks={projectTasks}
          onTaskClick={handleTaskClick}
          onTaskExecute={handleTaskExecute}
          onProjectNameChange={handleProjectNameChange}
          isLoading={isLoadingTasks}
        />

      </div>
      
      <InputBar 
        onSubmit={generateTasks} 
        isLoading={isLoadingTasks}
        placeholder={activeProject ? "Describe las tareas para tu proyecto..." : "Selecciona un proyecto primero"}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  );
}