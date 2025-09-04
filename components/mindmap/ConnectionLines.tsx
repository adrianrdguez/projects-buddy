import { MindMapCard, Connection } from "@/lib/mindmap-types";

interface ConnectionLinesProps {
  cards: Record<string, MindMapCard>;
  connections: Connection[];
  canvasSize: { width: number; height: number };
}

export function ConnectionLines({ cards, connections, canvasSize }: ConnectionLinesProps) {
  const getConnectionPath = (from: MindMapCard, to: MindMapCard, type: 'dependency' | 'hierarchy') => {
    const startX = from.position.x;
    const startY = from.position.y;
    const endX = to.position.x;
    const endY = to.position.y;

    if (type === 'hierarchy') {
      // Vertical tree connections: smooth curves for parent-child relationships
      if (from.type === 'root' && to.type === 'branch') {
        // Root to branch: vertical line with slight curve
        const midY = startY + (endY - startY) * 0.6;
        return `M ${startX} ${startY + 100} Q ${startX} ${midY} ${endX} ${endY - 60}`;
      } else if (from.type === 'branch' && to.type === 'task') {
        // Branch to task: curved line
        const midY = startY + (endY - startY) * 0.5;
        return `M ${startX} ${startY + 60} Q ${(startX + endX) / 2} ${midY} ${endX} ${endY - 50}`;
      }
      
      // Default curved connection
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    } else {
      // Dependency connections: dashed lines
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  };

  const getConnectionStyle = (type: 'dependency' | 'hierarchy') => {
    if (type === 'hierarchy') {
      return {
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
        fill: 'none',
        opacity: 0.6,
      };
    } else {
      return {
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1,
        strokeDasharray: '4 4',
        fill: 'none',
        opacity: 0.4,
      };
    }
  };

  const getArrowMarker = (type: 'dependency' | 'hierarchy') => {
    return type === 'hierarchy' ? 'url(#hierarchy-arrow)' : 'url(#dependency-arrow)';
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={canvasSize.width}
      height={canvasSize.height}
      style={{ overflow: 'visible' }}
    >
      {/* Define arrow markers */}
      <defs>
        <marker
          id="hierarchy-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--primary))" opacity="0.6" />
        </marker>
        <marker
          id="dependency-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        </marker>
      </defs>

      {connections
        .filter(connection => cards[connection.from] && cards[connection.to])
        .filter(connection => cards[connection.from].visible && cards[connection.to].visible)
        .map((connection, index) => {
          const fromCard = cards[connection.from];
          const toCard = cards[connection.to];
          
          return (
            <path
              key={`${connection.from}-${connection.to}-${index}`}
              d={getConnectionPath(fromCard, toCard, connection.type)}
              style={getConnectionStyle(connection.type)}
              markerEnd={getArrowMarker(connection.type)}
              className="transition-opacity duration-300"
            />
          );
        })}
    </svg>
  );
}