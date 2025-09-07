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

    // Use the pre-generated prompt if available, otherwise generate one
    const prompt = task.generatedPrompt || generatePromptForTask(task, project);
    
    // Call external Claude Code server with project context
    const executionResult = await executeWithClaudeCode(prompt, project.projectPath, task.targetFile);
    
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

async function executeWithClaudeCode(prompt: string, projectPath?: string, targetFile?: string): Promise<{status: string, filePath?: string}> {
  console.log('executeWithClaudeCode called with:', { projectPath, hasPrompt: !!prompt });
  
  try {
    const CLAUDE_CODE_SERVER_URL = 'http://localhost:3002';
    
    // If we have a project path, use your Claude Code server
    if (projectPath && projectPath.trim() !== '') {
      console.log('Using Claude Code server to open Cursor and send prompt');
      
      try {
        // First check if Claude Code server is available
        const healthResponse = await fetch(`${CLAUDE_CODE_SERVER_URL}/health`, {
          signal: AbortSignal.timeout(3000)
        });
        
        if (!healthResponse.ok) {
          throw new Error('Claude Code server not responding');
        }
        
        console.log('✅ Claude Code server is available');
        
        // Use your working /send-to-claude-code endpoint
        const response = await fetch(`${CLAUDE_CODE_SERVER_URL}/send-to-claude-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            projectPath: projectPath.trim(),
            projectName: 'MindMap Project',
            targetFile: targetFile || null // Use specified target file or let Claude Code decide
          }),
          signal: AbortSignal.timeout(30000)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Claude Code server responded:', result.message);
          
          return {
            status: result.success ? 'completed' : 'in_progress',
            filePath: result.workingDirectory || projectPath
          };
        } else {
          console.log('❌ Claude Code server error:', response.status, response.statusText);
          const errorData = await response.json().catch(() => null);
          throw new Error(`Claude Code server error: ${errorData?.message || response.statusText}`);
        }
        
      } catch (claudeError) {
        console.log('❌ Claude Code server error:', claudeError);
        
        // Fallback: just open Cursor without Claude Code
        console.log('📁 Fallback: Opening Cursor only...');
        const { spawn } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        
        // Validate path exists
        if (!fs.existsSync(projectPath)) {
          throw new Error(`Directory does not exist: ${projectPath}`);
        }
        
        // Open Cursor
        const absolutePath = path.resolve(projectPath.trim());
        const cursorProcess = spawn('cursor', [absolutePath], {
          detached: true,
          stdio: 'ignore',
          cwd: absolutePath
        });
        
        cursorProcess.unref();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          status: 'in_progress',
          filePath: projectPath
        };
      }
    } else {
      console.log('No project path provided, using Claude Code server general execution');
      
      try {
        // Check if Claude Code server is available
        const healthResponse = await fetch(`${CLAUDE_CODE_SERVER_URL}/health`, {
          signal: AbortSignal.timeout(3000)
        });
        
        if (!healthResponse.ok) {
          throw new Error('Claude Code server not responding');
        }
        
        // Use general execution without specific project path
        const response = await fetch(`${CLAUDE_CODE_SERVER_URL}/send-to-claude-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            projectPath: null,
            projectName: 'Generated Code',
            targetFile: targetFile || null
          }),
          signal: AbortSignal.timeout(30000)
        });
        
        if (!response.ok) {
          throw new Error(`Claude Code server responded with ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        return {
          status: result.success ? 'completed' : 'in_progress',
          filePath: result.workingDirectory
        };
        
      } catch (serverError) {
        console.log('❌ Claude Code server not available for general execution');
        throw new Error('Claude Code server is not available');
      }
    }
    
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