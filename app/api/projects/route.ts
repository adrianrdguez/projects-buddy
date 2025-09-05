import { NextRequest, NextResponse } from 'next/server';
import { CreateProjectRequest, ProjectsResponse, Project, ApiError } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse<ProjectsResponse | ApiError>> {
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

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    // Build query - filter by authenticated user using the authenticated client
    let query = userSupabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching projects:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch projects: ${error.message}`
        },
        { status: 500 }
      );
    }

    // Convert Supabase data to Project interface
    const projects: Project[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description || '',
      tech_stack: row.tech_stack || [],
      status: row.status || 'active',
      projectPath: row.project_path || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));

    return NextResponse.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Error in projects GET API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ProjectsResponse | ApiError>> {
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

    const body: CreateProjectRequest = await request.json();
    
    // Validate request body
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: name'
        },
        { status: 400 }
      );
    }

    if (body.name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project name must be at least 2 characters long'
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

    // Check if project with same name already exists for this user
    // Skip validation for now to avoid database issues - we'll add it back later
    // const { data: existingProjects, error: checkError } = await supabase
    //   .from('projects')
    //   .select('id')
    //   .eq('user_id', tempUserId)
    //   .ilike('name', body.name);

    // if (checkError) {
    //   console.error('Error checking existing projects:', checkError);
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'Failed to validate project name'
    //     },
    //     { status: 500 }
    //   );
    // }

    // if (existingProjects && existingProjects.length > 0) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'A project with this name already exists'
    //     },
    //     { status: 409 }
    //   );
    // }

    // Create new project in Supabase using the authenticated client
    const { data, error } = await userSupabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          tech_stack: body.tech_stack || [],
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create project: ${error.message}`
        },
        { status: 500 }
      );
    }

    // Convert to Project interface
    const newProject: Project = {
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
      projects: [newProject]
    }, { 
      status: 201
    });

  } catch (error) {
    console.error('Error in projects POST API:', error);
    
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