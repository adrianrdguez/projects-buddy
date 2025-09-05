import { MindMapCard, Connection } from "@/lib/mindmap-types";

interface ConnectionLinesProps {
  cards: Record<string, MindMapCard>;
  connections: Connection[];
  canvasSize: { width: number; height: number };
  animatedConnections?: string[];
}

export function ConnectionLines({ cards, connections, canvasSize, animatedConnections = [] }: ConnectionLinesProps) {
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

  const getConnectionStyle = (type: 'dependency' | 'hierarchy', isAnimated: boolean = false) => {
    if (type === 'hierarchy') {
      return {
        stroke: isAnimated ? '#3b82f6' : 'hsl(var(--primary))',
        strokeWidth: isAnimated ? 3 : 2,
        fill: 'none',
        opacity: isAnimated ? 0.8 : 0.6,
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

  const getArrowMarker = (type: 'dependency' | 'hierarchy', isAnimated: boolean = false) => {
    if (type === 'hierarchy') {
      return isAnimated ? 'url(#hierarchy-arrow-animated)' : 'url(#hierarchy-arrow)';
    } else {
      return 'url(#dependency-arrow)';
    }
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
          id="hierarchy-arrow-animated"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#10b981">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
          </path>
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
          const connectionId = `${connection.from}->${connection.to}`;
          const isAnimated = animatedConnections.includes(connectionId);
          const pathId = `path-${connection.from}-${connection.to}-${index}`;
          const pathData = getConnectionPath(fromCard, toCard, connection.type);
          
          
          return (
            <g key={`${connection.from}-${connection.to}-${index}`}>
              {/* Connection line */}
              <path
                id={pathId}
                d={pathData}
                style={getConnectionStyle(connection.type, isAnimated)}
                markerEnd={getArrowMarker(connection.type, isAnimated)}
                className="transition-all duration-500"
              />
              

              {/* Main data particle */}
              {isAnimated && (
                <circle
                  r="8"
                  fill="#10b981"
                  opacity="1"
                  style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    rotate="auto"
                    path={pathData}
                  />
                  <animate
                    attributeName="r"
                    values="6;12;6"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Data trail particles */}
              {isAnimated && (
                <circle
                  r="4"
                  fill="#3b82f6"
                  opacity="0.7"
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    rotate="auto"
                    begin="0.5s"
                    path={pathData}
                  />
                </circle>
              )}
            </g>
          );
        })}
    </svg>
  );
}