import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

interface ExecuteProjectRequest {
  projectId: string;
  projectPath: string;
  prompt: string;
}

interface ExecuteProjectResponse {
  success: boolean;
  status?: string;
  filePath?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteProjectResponse>> {
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

    const body: ExecuteProjectRequest = await request.json();
    
    // Validate request body
    if (!body.projectId || !body.projectPath || !body.prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: projectId, projectPath, and prompt'
        },
        { status: 400 }
      );
    }

    console.log('Executing project:', {
      projectId: body.projectId,
      projectPath: body.projectPath,
      promptLength: body.prompt.length
    });

    // Verify that the project belongs to the authenticated user
    const { data: project, error: projectError } = await userSupabase
      .from('projects')
      .select('id, name, project_path')
      .eq('id', body.projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project not found or access denied:', projectError);
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or access denied'
        },
        { status: 404 }
      );
    }

    // Open Cursor with the project directory
    const executionResult = await openCursorWithProject(body.projectPath, body.prompt);
    
    return NextResponse.json({
      success: true,
      status: executionResult.status,
      filePath: executionResult.filePath
    });

  } catch (error) {
    console.error('Error in execute-project API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

async function openCursorWithProject(projectPath: string, prompt: string): Promise<{status: string, filePath?: string}> {
  console.log('Opening Cursor with project path:', projectPath);
  
  try {
    const { spawn } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    // Validate that the path exists and is a directory
    if (!fs.existsSync(projectPath)) {
      console.error('Project path does not exist:', projectPath);
      throw new Error(`Directory does not exist: ${projectPath}`);
    }
    
    const stats = fs.statSync(projectPath);
    if (!stats.isDirectory()) {
      console.error('Project path is not a directory:', projectPath);
      throw new Error(`Path is not a directory: ${projectPath}`);
    }
    
    // Use absolute path and add trailing slash to ensure it's treated as a directory
    const absolutePath = path.resolve(projectPath.trim());
    console.log('Resolved absolute path:', absolutePath);
    
    // Open Cursor with the project directory
    const cursorProcess = spawn('cursor', [absolutePath], {
      detached: true,
      stdio: 'ignore',
      cwd: absolutePath // Set working directory
    });
    
    // Unref the process so it doesn't keep Node.js running
    cursorProcess.unref();
    
    // Give Cursor a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Cursor opened successfully for project');
    
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
        signal: AbortSignal.timeout(5000)
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
    return {
      status: 'in_progress',
      filePath: projectPath
    };
    
  } catch (error) {
    console.error('Failed to open Cursor:', error);
    throw new Error('Failed to open Cursor with project');
  }
}