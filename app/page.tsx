"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KanbanCanvas } from "@/components/KanbanCanvas";
import { InputBar } from "@/components/InputBar";
import { Project, Task, GenerateTasksResponse, ProjectsResponse, ExecuteTaskResponse } from "@/lib/types";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Set active project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await fetch('/api/projects');
      const data: ProjectsResponse = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
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
        projectId: activeProjectId,
        dependencies: [],
        estimatedTime: '1 hora',
        createdAt: now,
        updatedAt: now,
      };
      // Show only the user's input as a single card
      setTasks([optimisticTask]);
      
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          projectId: activeProjectId
        })
      });

      const data: GenerateTasksResponse = await response.json();
      
      if (data.success) {
        // Keep ONLY the optimistic user input card visible
        setTasks([optimisticTask]);
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
    const projectName = prompt('Nombre del nuevo proyecto:');
    if (!projectName) return;

    const projectDescription = prompt('Descripción (opcional):');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || ''
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
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    // Clear tasks when switching projects (in a real app, you'd load tasks for the selected project)
    setTasks([]);
    setError(null);
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

      const response = await fetch('/api/execute-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (isLoadingProjects) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId || undefined}
        onProjectSelect={handleProjectSelect}
        onNewProject={createNewProject}
      />
      
      <div className="flex flex-col flex-1">
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
        
        <KanbanCanvas
          projectName={activeProject?.name || "Selecciona un proyecto"}
          tasks={projectTasks}
          onTaskClick={handleTaskClick}
          onTaskExecute={handleTaskExecute}
          isLoading={isLoadingTasks}
        />

      </div>
      
      <InputBar 
        onSubmit={generateTasks} 
        isLoading={isLoadingTasks}
        placeholder={activeProject ? "Describe las tareas para tu proyecto..." : "Selecciona un proyecto primero"}
      />
    </div>
  );
}