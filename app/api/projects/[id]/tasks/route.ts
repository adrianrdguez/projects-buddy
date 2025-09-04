import { NextRequest, NextResponse } from 'next/server';
import { Task, ApiError } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

interface TasksResponse {
  success: boolean;
  tasks: Task[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TasksResponse | ApiError>> {
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

    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required'
        },
        { status: 400 }
      );
    }

    // First verify that the project belongs to the authenticated user
    const { data: project, error: projectError } = await userSupabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
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

    // Fetch tasks from Supabase using the authenticated client
    const { data, error } = await userSupabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching tasks:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch tasks'
        },
        { status: 500 }
      );
    }

    // Convert Supabase data to Task interface
    const tasks: Task[] = (data || []).map((row: any) => ({
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

    return NextResponse.json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Error in tasks GET API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}