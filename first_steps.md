Create the complete main dashboard page for an AI Task Planner app using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

TECH STACK:
- Next.js 14 App Router with TypeScript
- Tailwind CSS for styling
- shadcn/ui components (Button, Card, Input, etc.)
- Lucide React icons

LAYOUT REQUIREMENTS (based on wireframe):
- Left sidebar (320px fixed): Logo at top, projects list in middle, settings at bottom
- Main canvas area: Project header + grid layout for task cards  
- Bottom input bar: Fixed position with text input and microphone icon

SIDEBAR COMPONENTS:
- App logo/name "AI Planner" at top
- Projects list with bullet icons and project names
- "+ Nuevo proyecto" button
- Settings gear icon at bottom

CANVAS AREA:
- Current project name header: "Proyecto: App Fotógrafos de Surf"
- Grid layout (2x2) for task cards
- Each card shows: title, description, dashed border
- Cards: "Setup env", "Crear UI", "API Setup", "Auth flow"

INPUT BAR:
- Fixed at bottom of screen
- Text input with placeholder: "Describe tu tarea aquí..."
- Microphone icon on left
- Send button on right

STYLING:
- Dark theme (black, gray, blue accents)
- Modern design similar to ChatGPT/Notion interface
- Proper spacing, shadows, hover effects
- Responsive layout
- Similar to ChatGPT interface.

Use shadcn/ui Button, Card, and Input components. Import icons from lucide-react. Create proper TypeScript interfaces and make it production-ready.