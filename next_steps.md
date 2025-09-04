Replace the Kanban layout with a mind map/flowchart style canvas that shows the logical flow and relationships between tasks.

LAYOUT CONCEPT:
- Central root card: Main project idea (largest, prominent position)
- Branch cards: Major phases/categories emanating from center
- Leaf cards: Specific executable tasks connected to their parent branches
- Connecting lines: Show dependencies and logical flow between cards
- Organic positioning: Cards positioned to show natural progression

VISUAL HIERARCHY:
- Root card: Large, central, different styling (project overview)
- Branch cards: Medium size, positioned around root (Setup, Frontend, Backend, etc.)
- Task cards: Smaller, connected to branches with lines/arrows
- Connection lines: SVG paths or CSS lines showing relationships

CARD TYPES:
- Root: Project description, overall goal, tech stack
- Branch: Phase/category with summary (e.g., "Frontend Development - Create user interface")
- Task: Executable action with "Send to Editor" button

INTERACTION:
- Clicking root card could regenerate the entire breakdown
- Branch cards show/hide their connected task cards
- Task cards execute via existing /api/execute-task endpoint
- Visual feedback when tasks complete (color changes, checkmarks)

POSITIONING ALGORITHM:
- Root card at center (50% x, 50% y)
- Branch cards arranged in circle/radial pattern around root
- Task cards positioned near their parent branches
- Connecting lines draw paths between related cards

TECHNICAL IMPLEMENTATION:
- Use CSS Grid/Flexbox for base positioning
- SVG overlay for connection lines
- React state to track card positions and connections
- Responsive layout that works on different screen sizes
- Smooth animations when cards appear/move

Replace the current column-based layout with this hierarchical mind map that tells the story of how the project should be built, not just what needs to be built.