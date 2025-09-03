"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Canvas } from "@/components/Canvas";
import { InputBar } from "@/components/InputBar";
import { Project, Task } from "@/lib/types";

export default function Dashboard() {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "App Fotógrafos de Surf",
      description: "Aplicación para fotógrafos de surf",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [activeProjectId, setActiveProjectId] = useState<string>("1");

  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Setup env",
      description: "Configurar el entorno de desarrollo con las herramientas necesarias",
      status: "pending",
      projectId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      title: "Crear UI",
      description: "Diseñar y desarrollar la interfaz de usuario",
      status: "in_progress",
      projectId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      title: "API Setup",
      description: "Configurar la API backend y endpoints necesarios",
      status: "pending",
      projectId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      title: "Auth flow",
      description: "Implementar el flujo de autenticación de usuarios",
      status: "pending",
      projectId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  const handleNewProject = () => {
    // TODO: Implement new project creation
    console.log("Create new project");
  };

  const handleTaskClick = (task: Task) => {
    // TODO: Implement task details/editing
    console.log("Task clicked:", task);
  };

  const handleInputSubmit = (message: string) => {
    // TODO: Implement AI task creation
    console.log("New task:", message);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onProjectSelect={handleProjectSelect}
        onNewProject={handleNewProject}
      />
      
      <div className="flex flex-col flex-1">
        <Canvas
          projectName={activeProject?.name || ""}
          tasks={projectTasks}
          onTaskClick={handleTaskClick}
        />
        
        <div className="pb-20">
          {/* Spacer for fixed input bar */}
        </div>
      </div>
      
      <InputBar onSubmit={handleInputSubmit} />
    </div>
  );
}