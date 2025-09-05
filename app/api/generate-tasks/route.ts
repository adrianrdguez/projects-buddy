import { NextRequest, NextResponse } from 'next/server';
import { GenerateTasksRequest, GenerateTasksResponse, Task, ApiError } from '@/lib/types';
import openai from '@/lib/openai';
import { getAuthenticatedUser } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Helper function to generate task IDs
function generateTaskId(): string {
  return randomUUID();
}

// Helper function to generate multiple task IDs for dependencies
function generateTaskIds(count: number): string[] {
  return Array.from({ length: count }, () => generateTaskId());
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateTasksResponse | ApiError>> {
  try {
    // Get the authenticated user and supabase client
    const authResult = await getAuthenticatedUser(request);
    const { user, error: authError, supabase: userSupabase } = authResult;
    
    if (authError || !user || !userSupabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

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

    // Verify that the project belongs to the authenticated user
    const { data: project, error: projectError } = await userSupabase
      .from('projects')
      .select('id')
      .eq('id', body.projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or access denied'
        },
        { status: 404 }
      );
    }

    // Generate tasks using OpenAI API
    const { tasks: generatedTasks, projectName } = await generateTasksWithOpenAI(body.input, body.projectId);

    // Update project name if AI generated one
    if (projectName) {
      await userSupabase
        .from('projects')
        .update({ name: projectName })
        .eq('id', body.projectId)
        .eq('user_id', user.id);
    }

    // Save tasks to Supabase using the authenticated client
    const savedTasks = await saveTasksToDatabase(generatedTasks, userSupabase);

    return NextResponse.json({
      success: true,
      tasks: savedTasks,
      projectName
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

const validateEstimations = (tasks: any[]) => {
  return tasks.map((task: any) => {
    // Check if estimatedTime exists and is a string
    if (!task.estimatedTime || typeof task.estimatedTime !== 'string') {
      return task;
    }
    
    const time = task.estimatedTime.toLowerCase();
    
    // Si menciona "days" para tareas simples, convertir a horas
    if (time.includes('day') && !time.includes('complex') && !time.includes('integration')) {
      const days = parseInt(time);
      if (!isNaN(days) && days > 0) {
        task.estimatedTime = `${days * 4} hours`; // Convertir días a horas más realistas
      }
    }
    
    return task;
  });
};

async function generateTasksWithOpenAI(input: string, projectId: string): Promise<{tasks: Task[], projectName?: string}> {
  try {
    const systemMessage = `You are an expert project manager for AI-assisted development. The developer uses Cursor/Claude Code that writes most code automatically.

    IMPORTANT CONTEXT:
    - Developer has AI coding assistants (Cursor/Claude Code)
    - Code generation takes 5-15 minutes per component
    - Focus on prompting and integration, not manual coding
    - Estimates should reflect AI-assisted development speed
    
    Guidelines:
    1. Create 4-6 tasks (not 8+ - AI makes development faster)
    2. Time estimates for AI-assisted development:
       - Simple components: 10-30 minutes
       - Complex features: 1-3 hours
       - Setup/config: 15-45 minutes
    3. Focus on tasks that require human decision-making:
       - Architecture decisions
       - Integration points
       - Testing and validation
       - Refinement and polish
    
    Return ONLY a valid JSON object matching this exact structure:
{
  "projectName": "A creative, concise project name based on the user's description",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of what needs to be done",
      "priority": "high|medium|low",
      "dependencies": [0, 1], // Array of task indices this depends on (empty array if no dependencies)
      "estimatedTime": "X hours" // Format: "X hours" or "X days"
    }
  ]
}`

    const userMessage = `Break down this project into development tasks: "${input}"

    Example for "simple calculator app":
    - Setup Next.js project (15 minutes)
    - Create calculator component (30 minutes)  
    - Add styling (15 minutes)
    - Test functionality (15 minutes)
    
    Generate similar realistic tasks with AI-assisted development in mind.`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });


    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse: {
      projectName: string;
      tasks: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        dependencies: number[];
        estimatedTime: string;
      }>;
    };

    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const { projectName, tasks: parsedTasks } = parsedResponse;

    // Validate that we have tasks
    if (!parsedTasks || !Array.isArray(parsedTasks) || parsedTasks.length === 0) {
      console.error('No valid tasks in OpenAI response:', parsedResponse);
      throw new Error('No valid tasks generated by OpenAI');
    }

    // Validate and adjust time estimations
    const validatedTasks = validateEstimations(parsedTasks);

    // Validate and convert to Task format
    const currentTime = new Date();
    
    // Generate UUIDs for all tasks first
    const taskIds = generateTaskIds(validatedTasks.length);
    
    const convertedTasks = validatedTasks.map((task, index) => {
      // Convert dependency indices to actual task IDs
      const dependencies = (task.dependencies || []).map((depIndex: number) => {
        // Ensure dependency index is within bounds
        return depIndex < taskIds.length ? taskIds[depIndex] : generateTaskId();
      });
      
      const convertedTask = {
        id: taskIds[index],
        title: task.title || `Task ${index + 1}`, // Fallback title
        description: task.description || 'Generated task', // Fallback description
        status: 'ready' as const,
        priority: task.priority || 'medium' as const, // Fallback priority
        dependencies,
        estimatedTime: task.estimatedTime || '1 hour', // Fallback time
        project_id: projectId,
        createdAt: currentTime,
        updatedAt: currentTime
      };


      return convertedTask;
    });

    return { tasks: convertedTasks, projectName };

  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    
    // Fallback to template-based generation
    const fallbackTasks = await generateTasksFromTemplate(input, projectId);
    return { tasks: fallbackTasks };
  }
}

// Fallback function using the original template system
async function generateTasksFromTemplate(input: string, projectId: string): Promise<Task[]> {
  const currentTime = new Date();
  const taskTemplates = getTaskTemplatesForInput(input);
  
  // Generate UUIDs for all tasks first
  const taskIds = generateTaskIds(taskTemplates.length);
  
  const tasks = taskTemplates.map((template, index) => {
    // Convert string-based dependencies to actual UUIDs
    const dependencies = template.dependencies?.map(depString => {
      // Parse index from dependency string (now just simple numbers like "0", "1", "2")
      const depIndex = parseInt(depString);
      return depIndex < taskIds.length ? taskIds[depIndex] : generateTaskId();
    }) || [];

    return {
      id: taskIds[index],
      title: template.title,
      description: template.description,
      status: 'ready' as const,
      priority: template.priority,
      dependencies,
      estimatedTime: template.estimatedTime,
      project_id: projectId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
  });

  return tasks;
}

async function saveTasksToDatabase(tasks: Task[], userSupabase: any): Promise<Task[]> {
  if (tasks.length === 0) {
    return tasks;
  }

  try {
    // Prepare tasks for database insertion
    const tasksToInsert = tasks.map(task => ({
      id: task.id,
      project_id: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dependencies: task.dependencies,
      estimated_time: task.estimatedTime,
      ai_prompt: task.ai_prompt,
      generated_prompt: task.generated_prompt,
      target_file: task.target_file
    }));

    // Insert tasks into Supabase using the authenticated client
    const { data, error } = await userSupabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Error saving tasks to database:', error);
      // If database save fails, return the original tasks (fallback)
      return tasks;
    }

    // Convert database results back to Task interface
    const savedTasks: Task[] = (data || []).map((row: any) => ({
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      description: row.description || '',
      status: row.status,
      priority: row.priority,
      dependencies: row.dependencies || [],
      estimatedTime: row.estimated_time || '',
      target_file: row.target_file,
      ai_prompt: row.ai_prompt,
      generated_prompt: row.generated_prompt,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));

    return savedTasks;

  } catch (error) {
    console.error('Error in saveTasksToDatabase:', error);
    // Return original tasks as fallback
    return tasks;
  }
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
    return [
      {
        title: 'Setup Authentication Provider',
        description: 'Configure authentication service (Supabase, Auth0, or Firebase)',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '30 minutos'
      },
      {
        title: 'Create Login Component',
        description: 'Build login form with email/password and social auth options',
        priority: 'high' as const,
        dependencies: ['0'], // Depends on auth provider setup (index reference)
        estimatedTime: '45 minutos'
      },
      {
        title: 'Create Signup Component',
        description: 'Build registration form with validation and email confirmation',
        priority: 'high' as const,
        dependencies: ['0'], // Depends on auth provider setup (index reference)
        estimatedTime: '45 minutos'
      },
      {
        title: 'Implement Protected Routes',
        description: 'Add middleware to protect authenticated pages and API routes',
        priority: 'medium' as const,
        dependencies: ['1', '2'], // Depends on login/signup (index references)
        estimatedTime: '30 minutos'
      },
      {
        title: 'Setup User Profile Management',
        description: 'Create user profile page with update functionality',
        priority: 'low' as const,
        dependencies: ['3'], // Depends on protected routes (index reference)
        estimatedTime: '1 hora'
      }
    ];
  }
  
  if (lowerInput.includes('api') || lowerInput.includes('backend')) {
    return [
      {
        title: 'Design API Architecture',
        description: 'Plan REST API endpoints and data models',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '45 minutos'
      },
      {
        title: 'Setup Database Schema',
        description: 'Create database tables and relationships',
        priority: 'high' as const,
        dependencies: ['0'],
        estimatedTime: '30 minutos'
      },
      {
        title: 'Implement CRUD Operations',
        description: 'Build Create, Read, Update, Delete operations for main entities',
        priority: 'medium' as const,
        dependencies: ['1'],
        estimatedTime: '1.5 horas'
      },
      {
        title: 'Add API Validation',
        description: 'Implement request validation and error handling',
        priority: 'medium' as const,
        dependencies: ['2'],
        estimatedTime: '30 minutos'
      }
    ];
  }
  
  if (lowerInput.includes('ui') || lowerInput.includes('frontend') || lowerInput.includes('design')) {
    return [
      {
        title: 'Create Design System',
        description: 'Setup colors, typography, and component library',
        priority: 'high' as const,
        dependencies: [],
        estimatedTime: '1 hora'
      },
      {
        title: 'Build Main Layout',
        description: 'Create header, footer, and navigation components',
        priority: 'high' as const,
        dependencies: ['0'],
        estimatedTime: '45 minutos'
      },
      {
        title: 'Implement Responsive Design',
        description: 'Ensure mobile-first responsive design across all screens',
        priority: 'medium' as const,
        dependencies: ['1'],
        estimatedTime: '1 hora'
      },
      {
        title: 'Add Loading States',
        description: 'Implement skeleton screens and loading indicators',
        priority: 'low' as const,
        dependencies: ['2'],
        estimatedTime: '30 minutos'
      }
    ];
  }
  
  // Default generic tasks
  return [
    {
      title: 'Project Planning',
      description: `Plan and break down the requirements for: ${input}`,
      priority: 'high' as const,
      dependencies: [],
      estimatedTime: '15 minutos'
    },
    {
      title: 'Setup Development Environment',
      description: 'Configure tools, dependencies, and development workflow',
      priority: 'medium' as const,
      dependencies: ['0'],
      estimatedTime: '30 minutos'
    },
    {
      title: 'Implementation',
      description: `Implement the main functionality for: ${input}`,
      priority: 'high' as const,
      dependencies: ['1'],
      estimatedTime: '2 horas'
    },
    {
      title: 'Testing & Documentation',
      description: 'Write tests and update documentation',
      priority: 'medium' as const,
      dependencies: ['2'],
      estimatedTime: '45 minutos'
    }
  ];
}