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
      // Calculate edge points for better particle animation
      let actualStartX = startX;
      let actualStartY = startY;
      let actualEndX = endX;
      let actualEndY = endY;

      // Adjust start point to edge of source card
      if (from.type === 'root') {
        actualStartY = startY + (from.size.height / 2); // Bottom edge of root card
      } else if (from.type === 'branch') {
        actualStartY = startY + (from.size.height / 2); // Bottom edge of branch card
      }

      // Adjust end point to edge of target card  
      if (to.type === 'branch') {
        actualEndY = endY - (to.size.height / 2); // Top edge of branch card
      } else if (to.type === 'task') {
        actualEndY = endY - (to.size.height / 2); // Top edge of task card
      }

      // Vertical tree connections: smooth curves for parent-child relationships
      if (from.type === 'root' && to.type === 'branch') {
        const midY = actualStartY + (actualEndY - actualStartY) * 0.6;
        return `M ${actualStartX} ${actualStartY} Q ${actualStartX} ${midY} ${actualEndX} ${actualEndY}`;
      } else if (from.type === 'branch' && to.type === 'task') {
        const midY = actualStartY + (actualEndY - actualStartY) * 0.5;
        return `M ${actualStartX} ${actualStartY} Q ${(actualStartX + actualEndX) / 2} ${midY} ${actualEndX} ${actualEndY}`;
      }
      
      // Default curved connection
      const midX = (actualStartX + actualEndX) / 2;
      const midY = (actualStartY + actualEndY) / 2;
      return `M ${actualStartX} ${actualStartY} Q ${midX} ${midY} ${actualEndX} ${actualEndY}`;
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


  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={canvasSize.width}
      height={canvasSize.height}
      style={{ overflow: 'visible' }}
    >

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
                    begin="0s"
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