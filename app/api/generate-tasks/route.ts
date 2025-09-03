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
    status: 'pending' as const,
    priority: template.priority,
    projectId,
    createdAt: currentTime,
    updatedAt: currentTime
  }));
}

function getTaskTemplatesForInput(input: string): Array<{title: string, description: string, priority: 'low' | 'medium' | 'high'}> {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('auth') || lowerInput.includes('login') || lowerInput.includes('signup')) {
    return [
      {
        title: 'Setup Authentication Provider',
        description: 'Configure authentication service (Supabase, Auth0, or Firebase)',
        priority: 'high'
      },
      {
        title: 'Create Login Component',
        description: 'Build login form with email/password and social auth options',
        priority: 'high'
      },
      {
        title: 'Create Signup Component',
        description: 'Build registration form with validation and email confirmation',
        priority: 'high'
      },
      {
        title: 'Implement Protected Routes',
        description: 'Add middleware to protect authenticated pages and API routes',
        priority: 'medium'
      },
      {
        title: 'Setup User Profile Management',
        description: 'Create user profile page with update functionality',
        priority: 'low'
      }
    ];
  }
  
  if (lowerInput.includes('api') || lowerInput.includes('backend')) {
    return [
      {
        title: 'Design API Architecture',
        description: 'Plan REST API endpoints and data models',
        priority: 'high'
      },
      {
        title: 'Setup Database Schema',
        description: 'Create database tables and relationships',
        priority: 'high'
      },
      {
        title: 'Implement CRUD Operations',
        description: 'Build Create, Read, Update, Delete operations for main entities',
        priority: 'medium'
      },
      {
        title: 'Add API Validation',
        description: 'Implement request validation and error handling',
        priority: 'medium'
      }
    ];
  }
  
  if (lowerInput.includes('ui') || lowerInput.includes('frontend') || lowerInput.includes('design')) {
    return [
      {
        title: 'Create Design System',
        description: 'Setup colors, typography, and component library',
        priority: 'high'
      },
      {
        title: 'Build Main Layout',
        description: 'Create header, footer, and navigation components',
        priority: 'high'
      },
      {
        title: 'Implement Responsive Design',
        description: 'Ensure mobile-first responsive design across all screens',
        priority: 'medium'
      },
      {
        title: 'Add Loading States',
        description: 'Implement skeleton screens and loading indicators',
        priority: 'low'
      }
    ];
  }
  
  // Default generic tasks
  return [
    {
      title: 'Project Planning',
      description: `Plan and break down the requirements for: ${input}`,
      priority: 'high'
    },
    {
      title: 'Setup Development Environment',
      description: 'Configure tools, dependencies, and development workflow',
      priority: 'medium'
    },
    {
      title: 'Implementation',
      description: `Implement the main functionality for: ${input}`,
      priority: 'high'
    },
    {
      title: 'Testing & Documentation',
      description: 'Write tests and update documentation',
      priority: 'medium'
    }
  ];
}