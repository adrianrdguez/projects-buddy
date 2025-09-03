import { NextRequest, NextResponse } from 'next/server';
import { GenerateTasksRequest, GenerateTasksResponse, Task, ApiError } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<GenerateTasksResponse | ApiError>> {
  try {
    const body: GenerateTasksRequest = await request.json();
    
    // Validate request body
    if (!body.input || !body.projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: input and projectId'
        },
        { status: 400 }
      );
    }

    if (body.input.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input must be at least 3 characters long'
        },
        { status: 400 }
      );
    }

    // Mock AI task generation (replace with actual OpenAI/Claude API call)
    const generatedTasks = await generateTasksFromInput(body.input, body.projectId);

    return NextResponse.json({
      success: true,
      tasks: generatedTasks
    });

  } catch (error) {
    console.error('Error in generate-tasks API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

async function generateTasksFromInput(input: string, projectId: string): Promise<Task[]> {
  // Mock implementation - replace with actual AI API call
  const currentTime = new Date();
  
  // Simple task generation based on common patterns
  const taskTemplates = getTaskTemplatesForInput(input);
  
  return taskTemplates.map((template, index) => ({
    id: `task-${Date.now()}-${index}`,
    title: template.title,
    description: template.description,
    status: 'ready' as const,
    priority: template.priority,
    dependencies: template.dependencies || [],
    estimatedTime: template.estimatedTime,
    projectId,
    createdAt: currentTime,
    updatedAt: currentTime
  }));
}

function getTaskTemplatesForInput(input: string): Array<{
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[];
  estimatedTime: string;
}> {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('auth') || lowerInput.includes('login') || lowerInput.includes('signup')) {
    const authTasks = [
      {
        title: 'Setup Authentication Provider',
        description: 'Configure authentication service (Supabase, Auth0, or Firebase)',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '2 horas'
      },
      {
        title: 'Create Login Component',
        description: 'Build login form with email/password and social auth options',
        priority: 'high' as const,
        dependencies: ['task-${Date.now()}-0'], // Depends on auth provider setup
        estimatedTime: '3 horas'
      },
      {
        title: 'Create Signup Component',
        description: 'Build registration form with validation and email confirmation',
        priority: 'high' as const,
        dependencies: ['task-${Date.now()}-0'], // Depends on auth provider setup
        estimatedTime: '4 horas'
      },
      {
        title: 'Implement Protected Routes',
        description: 'Add middleware to protect authenticated pages and API routes',
        priority: 'medium' as const,
        dependencies: ['task-${Date.now()}-1', 'task-${Date.now()}-2'], // Depends on login/signup
        estimatedTime: '2 horas'
      },
      {
        title: 'Setup User Profile Management',
        description: 'Create user profile page with update functionality',
        priority: 'low' as const,
        dependencies: ['task-${Date.now()}-3'], // Depends on protected routes
        estimatedTime: '3 horas'
      }
    ];

    // Fix dependencies with actual task IDs
    const baseId = Date.now();
    return authTasks.map((task, index) => ({
      ...task,
      dependencies: task.dependencies?.map(dep => 
        dep.replace('task-${Date.now()}', `task-${baseId}`)
      ) || []
    }));
  }
  
  if (lowerInput.includes('api') || lowerInput.includes('backend')) {
    const baseId = Date.now();
    return [
      {
        title: 'Design API Architecture',
        description: 'Plan REST API endpoints and data models',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '3 horas'
      },
      {
        title: 'Setup Database Schema',
        description: 'Create database tables and relationships',
        priority: 'high' as const,
        dependencies: [`task-${baseId}-0`],
        estimatedTime: '4 horas'
      },
      {
        title: 'Implement CRUD Operations',
        description: 'Build Create, Read, Update, Delete operations for main entities',
        priority: 'medium' as const,
        dependencies: [`task-${baseId}-1`],
        estimatedTime: '6 horas'
      },
      {
        title: 'Add API Validation',
        description: 'Implement request validation and error handling',
        priority: 'medium' as const,
        dependencies: [`task-${baseId}-2`],
        estimatedTime: '2 horas'
      }
    ];
  }
  
  if (lowerInput.includes('ui') || lowerInput.includes('frontend') || lowerInput.includes('design')) {
    const baseId = Date.now();
    return [
      {
        title: 'Create Design System',
        description: 'Setup colors, typography, and component library',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '4 horas'
      },
      {
        title: 'Build Main Layout',
        description: 'Create header, footer, and navigation components',
        priority: 'high' as const,
        dependencies: [`task-${baseId}-0`],
        estimatedTime: '3 horas'
      },
      {
        title: 'Implement Responsive Design',
        description: 'Ensure mobile-first responsive design across all screens',
        priority: 'medium' as const,
        dependencies: [`task-${baseId}-1`],
        estimatedTime: '5 horas'
      },
      {
        title: 'Add Loading States',
        description: 'Implement skeleton screens and loading indicators',
        priority: 'low' as const,
        dependencies: [`task-${baseId}-2`],
        estimatedTime: '2 horas'
      }
    ];
  }
  
  // Default generic tasks
  const baseId = Date.now();
  return [
    {
      title: 'Project Planning',
      description: `Plan and break down the requirements for: ${input}`,
      priority: 'high' as const,
      dependencies: [],
      estimatedTime: '1 hora'
    },
    {
      title: 'Setup Development Environment',
      description: 'Configure tools, dependencies, and development workflow',
      priority: 'medium' as const,
      dependencies: [`task-${baseId}-0`],
      estimatedTime: '2 horas'
    },
    {
      title: 'Implementation',
      description: `Implement the main functionality for: ${input}`,
      priority: 'high' as const,
      dependencies: [`task-${baseId}-1`],
      estimatedTime: '8 horas'
    },
    {
      title: 'Testing & Documentation',
      description: 'Write tests and update documentation',
      priority: 'medium' as const,
      dependencies: [`task-${baseId}-2`],
      estimatedTime: '3 horas'
    }
  ];
}