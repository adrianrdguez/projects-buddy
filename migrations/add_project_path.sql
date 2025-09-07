-- Add project_path column to projects table
ALTER TABLE projects 
ADD COLUMN project_path TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN projects.project_path IS 'Local directory path where project files are located for code execution';

-- Create an index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_projects_project_path ON projects(project_path) WHERE project_path IS NOT NULL;