import { NextRequest, NextResponse } from 'next/server';
import { CreateProjectRequest, ProjectsResponse, Project, ApiError } from '@/lib/types';

// Mock database - replace with actual database in production
let mockProjects: Project[] = [
  {
    id: '1',
    name: 'App Fotógrafos de Surf',
    description: 'Aplicación para fotógrafos de surf profesionales',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'E-commerce Platform',
    description: 'Plataforma de comercio electrónico con Next.js',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    name: 'Task Management System',
    description: 'Sistema de gestión de tareas con IA',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-20')
  }
];

export async function GET(request: NextRequest): Promise<NextResponse<ProjectsResponse | ApiError>> {
  try {
    // Add CORS headers if needed
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    let filteredProjects = [...mockProjects];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (limitNum > 0) {
        filteredProjects = filteredProjects.slice(0, limitNum);
      }
    }

    // Sort by updatedAt (most recent first)
    filteredProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      projects: filteredProjects
    }, { headers });

  } catch (error) {
    console.error('Error in projects GET API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ProjectsResponse | ApiError>> {
  try {
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

    // Check if project with same name already exists
    const existingProject = mockProjects.find(
      project => project.name.toLowerCase() === body.name.toLowerCase()
    );

    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'A project with this name already exists'
        },
        { status: 409 }
      );
    }

    // Create new project
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to mock database
    mockProjects.unshift(newProject);

    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json({
      success: true,
      projects: [newProject]
    }, { 
      status: 201,
      headers 
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
        error: 'Failed to create project'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}