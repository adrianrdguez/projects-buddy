import { NextRequest, NextResponse } from 'next/server';
import { GenerateTasksRequest, GenerateTasksResponse, Task, ApiError } from '@/lib/types';
import openai from '@/lib/openai';

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

    // Generate tasks using OpenAI API
    const generatedTasks = await generateTasksWithOpenAI(body.input, body.projectId);

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

async function generateTasksWithOpenAI(input: string, projectId: string): Promise<Task[]> {
  console.log('🚀 Starting OpenAI task generation for input:', input);
  
  try {
    const systemMessage = `You are an expert project manager and technical architect. Your job is to break down user requirements into detailed, actionable development tasks with proper dependencies and realistic time estimates.

Follow these guidelines:
1. Create 4-8 tasks that logically break down the project
2. Each task should be specific and actionable
3. Include proper dependency chains (use task indices like 0, 1, 2 for dependencies)
4. Provide realistic time estimates
5. Assign appropriate priorities (high, medium, low)
6. Think about phases: Planning → Setup → Core Development → Testing/Polish

Return ONLY a valid JSON array of tasks matching this exact structure:
[
  {
    "title": "Task title",
    "description": "Detailed description of what needs to be done",
    "priority": "high|medium|low",
    "dependencies": [0, 1], // Array of task indices this depends on (empty array if no dependencies)
    "estimatedTime": "X hours" // Format: "X hours" or "X days"
  }
]`;

    const userMessage = `Break down this project into development tasks: "${input}"

Consider the technical requirements, user experience, and implementation phases. Create tasks that would guide a developer from start to finish.`;

    console.log('📤 Sending request to OpenAI...');
    console.log('System message length:', systemMessage.length);
    console.log('User message:', userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('📥 Received response from OpenAI');
    console.log('Usage:', completion.usage);

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error('❌ No response content from OpenAI');
      throw new Error('No response from OpenAI');
    }

    console.log('📄 Raw OpenAI response:');
    console.log('Response length:', response.length);
    console.log('Response content:', response);

    // Parse the JSON response
    let parsedTasks: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      dependencies: number[];
      estimatedTime: string;
    }>;

    try {
      parsedTasks = JSON.parse(response);
      console.log('✅ Successfully parsed JSON response');
      console.log('Number of tasks parsed:', parsedTasks.length);
      console.log('Parsed tasks:', parsedTasks);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', response);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate and convert to Task format
    const currentTime = new Date();
    const baseId = Date.now();
    
    console.log('🔄 Converting to Task format with base ID:', baseId);
    
    const convertedTasks = parsedTasks.map((task, index) => {
      // Convert dependency indices to actual task IDs
      const dependencies = task.dependencies.map(depIndex => `task-${baseId}-${depIndex}`);
      
      const convertedTask = {
        id: `task-${baseId}-${index}`,
        title: task.title,
        description: task.description,
        status: 'ready' as const,
        priority: task.priority,
        dependencies,
        estimatedTime: task.estimatedTime,
        projectId,
        createdAt: currentTime,
        updatedAt: currentTime
      };

      console.log(`Task ${index}:`, {
        id: convertedTask.id,
        title: convertedTask.title,
        priority: convertedTask.priority,
        dependencies: convertedTask.dependencies,
        estimatedTime: convertedTask.estimatedTime
      });

      return convertedTask;
    });

    console.log('✅ Successfully generated', convertedTasks.length, 'tasks with OpenAI');
    return convertedTasks;

  } catch (error: unknown) {
    console.error('❌ OpenAI API error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Fallback to template-based generation
    console.log('🔄 Falling back to template-based task generation');
    return generateTasksFromTemplate(input, projectId);
  }
}

// Fallback function using the original template system
async function generateTasksFromTemplate(input: string, projectId: string): Promise<Task[]> {
  console.log('🔧 Using fallback template system for input:', input);
  
  const currentTime = new Date();
  const taskTemplates = getTaskTemplatesForInput(input);
  
  console.log('📋 Template system generated', taskTemplates.length, 'task templates');
  
  const tasks = taskTemplates.map((template, index) => ({
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

  console.log('🏁 Fallback system completed with', tasks.length, 'tasks');
  tasks.forEach((task, index) => {
    console.log(`Fallback Task ${index}:`, {
      id: task.id,
      title: task.title,
      priority: task.priority,
      estimatedTime: task.estimatedTime
    });
  });

  return tasks;
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