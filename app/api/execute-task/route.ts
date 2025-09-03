import { NextRequest, NextResponse } from 'next/server';
import { ExecuteTaskRequest, ExecuteTaskResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteTaskResponse | ApiError>> {
  try {
    const body: ExecuteTaskRequest = await request.json();
    
    // Validate request body
    if (!body.taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: taskId'
        },
        { status: 400 }
      );
    }

    // Mock task data retrieval (replace with actual database lookup)
    const task = await getTaskById(body.taskId);
    
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found'
        },
        { status: 404 }
      );
    }

    // Generate optimized prompt for the task
    const optimizedPrompt = generatePromptForTask(task);
    
    // Call external Claude Code server
    const executionResult = await executeWithClaudeCode(optimizedPrompt);
    
    return NextResponse.json({
      success: true,
      status: executionResult.status,
      filePath: executionResult.filePath
    });

  } catch (error) {
    console.error('Error in execute-task API:', error);
    
    if (error instanceof Error && error.message.includes('Claude Code server')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Claude Code server is not available'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

async function getTaskById(taskId: string) {
  // Mock implementation - replace with actual database query
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Setup Authentication Provider',
      description: 'Configure authentication service (Supabase, Auth0, or Firebase)',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'task-2',
      title: 'Create Login Component',
      description: 'Build login form with email/password and social auth options',
      priority: 'high',
      status: 'pending'
    }
  ];
  
  return mockTasks.find(task => task.id === taskId);
}

function generatePromptForTask(task: any): string {
  const basePrompt = `Task: ${task.title}
Description: ${task.description}
Priority: ${task.priority}

Please implement this task following best practices:
- Use TypeScript with proper type definitions
- Follow modern React/Next.js patterns
- Include proper error handling
- Add appropriate comments for complex logic
- Ensure responsive design if UI-related
- Follow security best practices

Generate clean, production-ready code that accomplishes this task.`;

  // Add specific instructions based on task type
  if (task.title.toLowerCase().includes('component')) {
    return basePrompt + `

Additional requirements for React component:
- Use functional components with hooks
- Include proper PropTypes or TypeScript interfaces
- Implement loading and error states
- Follow accessibility guidelines
- Use CSS modules or styled-components for styling`;
  }
  
  if (task.title.toLowerCase().includes('api')) {
    return basePrompt + `

Additional requirements for API:
- Use Next.js API routes with proper HTTP methods
- Include request validation and sanitization
- Implement proper error responses with status codes
- Add rate limiting if needed
- Include comprehensive error logging`;
  }
  
  if (task.title.toLowerCase().includes('auth')) {
    return basePrompt + `

Additional requirements for authentication:
- Never store passwords in plain text
- Use secure session management
- Implement proper CSRF protection
- Include email verification flow
- Add password strength requirements
- Follow OWASP security guidelines`;
  }
  
  return basePrompt;
}

async function executeWithClaudeCode(prompt: string): Promise<{status: string, filePath?: string}> {
  const CLAUDE_CODE_SERVER_URL = 'http://localhost:3002';
  
  try {
    const response = await fetch(`${CLAUDE_CODE_SERVER_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        language: 'typescript',
        framework: 'nextjs'
      }),
      // 30 second timeout for code execution
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`Claude Code server responded with ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      status: result.success ? 'completed' : 'failed',
      filePath: result.filePath
    };
    
  } catch (error) {
    console.error('Failed to execute with Claude Code:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Claude Code server execution timeout');
      }
      if (error.message.includes('fetch')) {
        throw new Error('Claude Code server is not available');
      }
    }
    
    throw error;
  }
}