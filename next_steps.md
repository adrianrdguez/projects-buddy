# Add Project Directory Selector to Web App

I need to add a directory/folder selector to my web app so users can choose where their AI-generated code will be executed. Currently, when users generate tasks, the system opens Cursor/IDE randomly without knowing where the project should be created.

## Current Flow:
1. User describes project in web app
2. AI generates tasks
3. User clicks "execute task" 
4. Server opens Cursor but doesn't know which directory to use

## Needed Changes:

### 1. Add Directory Picker to Frontend
- Add a folder selection input/button in the project creation flow
- Store the selected directory path in the project data
- Show the current selected directory in the UI

### 2. Update API to Handle Project Path
- Modify the task execution endpoint to receive `projectPath`
- Update the server to open Cursor in the specific directory
- Include project path context in prompts sent to Cursor

### 3. Enhanced Task Execution
- When opening Cursor, use: `cursor "${projectPath}"`
- Include directory context in the AI prompt so it knows the project structure

## Files to modify:
- Frontend: Add directory picker component
- API route: Update task execution endpoint
- Server: Modify Cursor launch command

The goal is that when a user clicks "execute task", Cursor opens in their chosen project directory with full context of where to create/modify files.

Please implement this directory selection and context passing system.