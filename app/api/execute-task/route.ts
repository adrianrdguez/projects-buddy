import { NextRequest, NextResponse } from 'next/server';
import { ExecuteTaskRequest, ExecuteTaskResponse, ApiError } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteTaskResponse | ApiError>> {
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

    // Get task and project data from database
    const taskData = await getTaskWithProject(userSupabase, body.taskId, user.id);
    
    if (!taskData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found or access denied'
        },
        { status: 404 }
      );
    }

    const { task, project } = taskData;

    // Generate optimized prompt for the task
    const optimizedPrompt = generatePromptForTask(task, project);
    
    // Call external Claude Code server with project context
    const executionResult = await executeWithClaudeCode(optimizedPrompt, project.projectPath);
    
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

async function getTaskWithProject(supabase: any, taskId: string, userId: string) {
  try {
    // Get task with project information
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name,
          project_path,
          tech_stack,
          description
        )
      `)
      .eq('id', taskId)
      .eq('projects.user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching task with project:', error);
      return null;
    }

    return {
      task: {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        estimatedTime: data.estimated_time,
        targetFile: data.target_file,
        aiPrompt: data.ai_prompt,
        generatedPrompt: data.generated_prompt,
      },
      project: {
        id: data.projects.id,
        name: data.projects.name,
        projectPath: data.projects.project_path,
        techStack: data.projects.tech_stack || [],
        description: data.projects.description,
      }
    };
  } catch (error) {
    console.error('Error in getTaskWithProject:', error);
    return null;
  }
}

function generatePromptForTask(task: any, project: any): string {
  const basePrompt = `Project: ${project.name}
${project.description ? `Project Description: ${project.description}` : ''}
Tech Stack: ${project.techStack.join(', ')}
${project.projectPath ? `Project Directory: ${project.projectPath}` : ''}

Task: ${task.title}
Task Description: ${task.description}
Priority: ${task.priority}
${task.estimatedTime ? `Estimated Time: ${task.estimatedTime}` : ''}
${task.targetFile ? `Target File: ${task.targetFile}` : ''}

Please implement this task following best practices:
- Use TypeScript with proper type definitions
- Follow modern React/Next.js patterns
- Include proper error handling
- Add appropriate comments for complex logic
- Ensure responsive design if UI-related
- Follow security best practices
- Work within the existing project structure and tech stack

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

async function executeWithClaudeCode(prompt: string, projectPath?: string): Promise<{status: string, filePath?: string}> {
  console.log('executeWithClaudeCode called with:', { projectPath, hasPrompt: !!prompt });
  
  try {
    // If we have a project path, open Cursor in that directory
    if (projectPath && projectPath.trim() !== '') {
      console.log('Opening Cursor with project path:', projectPath);
      
      const { spawn } = require('child_process');
      
      // Open Cursor with the project directory
      const cursorProcess = spawn('cursor', [projectPath.trim()], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Listen for process events for debugging
      cursorProcess.on('error', (error: any) => {
        console.error('Failed to start Cursor:', error);
      });
      
      cursorProcess.on('close', (code: number) => {
        console.log(`Cursor process exited with code ${code}`);
      });
      
      // Don't wait for Cursor to close, but give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Cursor should now be opening...');
      
      // Try to send the prompt to Claude Code server (optional)
      try {
        const CLAUDE_CODE_SERVER_URL = 'http://localhost:3002';
        console.log('Attempting to contact Claude Code server...');
        
        const response = await fetch(`${CLAUDE_CODE_SERVER_URL}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            language: 'typescript',
            framework: 'nextjs',
            projectPath: projectPath
          }),
          signal: AbortSignal.timeout(5000) // Reduced timeout
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Claude Code server responded successfully');
          return {
            status: result.success ? 'completed' : 'in_progress',
            filePath: result.filePath || projectPath
          };
        } else {
          console.log('Claude Code server responded with error:', response.status);
        }
      } catch (claudeError) {
        console.log('Claude Code server not available:', claudeError);
      }
      
      // Return success even if Claude Code server is not available
      console.log('Returning success - Cursor opened, Claude Code server optional');
      return {
        status: 'in_progress',
        filePath: projectPath
      };
    } else {
      console.log('No project path provided, trying Claude Code server only');
      // Fallback: try to use Claude Code server without project path
      const CLAUDE_CODE_SERVER_URL = 'http://localhost:3002';
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
    }
    
  } catch (error) {
    console.error('Failed to execute with Claude Code:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Claude Code server execution timeout');
      }
      if (error.message.includes('fetch')) {
        throw new Error('Claude Code server is not available, but Cursor may have opened');
      }
    }
    
    throw error;
  }
}