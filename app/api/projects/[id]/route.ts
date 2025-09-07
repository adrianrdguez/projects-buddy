import { NextRequest, NextResponse } from 'next/server';
import { Project, ApiError } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

interface UpdateProjectRequest {
  name?: string;
  description?: string;
  tech_stack?: string[];
  status?: 'active' | 'completed' | 'archived';
  projectPath?: string;
}

interface ProjectResponse {
  success: boolean;
  project?: Project;
  error?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProjectResponse | ApiError>> {
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

    const body: UpdateProjectRequest = await request.json();
    
    // Validate that there's something to update
    if (!body.name && !body.description && !body.tech_stack && !body.status && body.projectPath === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update provided'
        },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (body.name !== undefined) {
      if (body.name.length < 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Project name cannot be empty'
          },
          { status: 400 }
        );
      }

      if (body.name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Project name must be less than 100 characters'
          },
          { status: 400 }
        );
      }
    }

    // Validate projectPath if provided
    if (body.projectPath !== undefined) {
      if (body.projectPath !== null && body.projectPath.length > 500) {
        return NextResponse.json(
          {
            success: false,
            error: 'Project path must be less than 500 characters'
          },
          { status: 400 }
        );
      }
    }

    // First verify that the project belongs to the authenticated user
    const { data: existingProject, error: projectError } = await userSupabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or access denied'
        },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.tech_stack !== undefined) updateData.tech_stack = body.tech_stack;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.projectPath !== undefined) updateData.project_path = body.projectPath?.trim() || null;

    // Update project in Supabase
    const { data, error } = await userSupabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update project: ${error.message}`
        },
        { status: 500 }
      );
    }

    // Convert to Project interface
    const updatedProject: Project = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || '',
      tech_stack: data.tech_stack || [],
      status: data.status,
      projectPath: data.project_path || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    return NextResponse.json({
      success: true,
      project: updatedProject
    });

  } catch (error) {
    console.error('Error in project PATCH API:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
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
    const { data: existingProject, error: projectError } = await userSupabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or access denied'
        },
        { status: 404 }
      );
    }

    // First, delete all tasks associated with the project
    const { error: tasksDeleteError } = await userSupabase
      .from('tasks')
      .delete()
      .eq('project_id', projectId);

    if (tasksDeleteError) {
      console.error('Error deleting project tasks:', tasksDeleteError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete project tasks: ${tasksDeleteError.message}`
        },
        { status: 500 }
      );
    }

    // Then delete the project itself
    const { error } = await userSupabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete project: ${error.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in project DELETE API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}