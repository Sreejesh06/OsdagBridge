import React, { useState } from "react";

interface SupportCADWidgetProps {
  spanLength?: number;
  numGirders?: number;
  girderSpacing?: number;
  bracingSpacing?: number;
}

export default function SupportCADWidget({
  spanLength = 35.0,
  numGirders = 4,
  girderSpacing = 2.75,
  bracingSpacing = 3.5,
}: SupportCADWidgetProps) {
  // SVG viewBox setup
  const W = 500;
  const H = 280;

  // Margin and workable area
  const marginX = 80;
  const marginY = 50;
  const plotW = W - 2 * marginX;
  const plotH = H - 2 * marginY;

  // Hover state for interactivity
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // We want to scale the span and width to fit the plot area.
  // The actual width of the bridge is (numGirders - 1) * girderSpacing
  const bridgeWidth = Math.max(1, (numGirders - 1) * girderSpacing);
  
  // Calculate vertical positions for girders
  // They should be centered in the plotH
  const girderPositions: number[] = [];
  if (numGirders > 1) {
    const startY = marginY + (plotH - (plotH * bridgeWidth / Math.max(bridgeWidth, spanLength * 0.4))) / 2;
    // We'll just define visual spacing
    const visualSpacing = plotH / Math.max(numGirders - 1, 1);
    for (let i = 0; i < numGirders; i++) {
      girderPositions.push(marginY + i * visualSpacing);
    }
  } else {
    girderPositions.push(marginY + plotH / 2);
  }

  const leftBearingX = marginX;
  const rightBearingX = marginX + plotW;
  const topExtent = girderPositions[0] - 10;
  const botExtent = girderPositions[girderPositions.length - 1] + 10;

  // Number of braces
  const numBraces = bracingSpacing > 0 ? Math.max(1, Math.ceil(spanLength / bracingSpacing)) : 1;
  const visualBraceSpacing = plotW / numBraces;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="#ffffff" />

      {/* Cross Bracing (Vertical lines) */}
      {numGirders > 1 && Array.from({ length: numBraces - 1 }).map((_, idx) => {
        const x = leftBearingX + (idx + 1) * visualBraceSpacing;
        const isHovered = hoveredElement === 'cross_bracing';
        return (
          <line
            key={`brace-${idx}`}
            x1={x}
            y1={girderPositions[0]}
            x2={x}
            y2={girderPositions[girderPositions.length - 1]}
            stroke={isHovered ? "#ffb45a" : "#a1a1a1"}
            strokeWidth={isHovered ? "3.5" : "1.8"}
            onMouseEnter={() => setHoveredElement('cross_bracing')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: "pointer" }}
          />
        );
      })}

      {/* End Diaphragms (Double lines at ends) */}
      {numGirders > 1 && (
        <g 
          onMouseEnter={() => setHoveredElement('end_diaphragm')} 
          onMouseLeave={() => setHoveredElement(null)}
          style={{ cursor: "pointer" }}
        >
          {/* Invisible larger hit area for easier hovering */}
          <rect x={leftBearingX - 10} y={girderPositions[0]} width={20} height={girderPositions[girderPositions.length - 1] - girderPositions[0]} fill="transparent" />
          <rect x={rightBearingX - 10} y={girderPositions[0]} width={20} height={girderPositions[girderPositions.length - 1] - girderPositions[0]} fill="transparent" />
          
          <line x1={leftBearingX - 2} y1={girderPositions[0]} x2={leftBearingX - 2} y2={girderPositions[girderPositions.length - 1]} stroke={hoveredElement === 'end_diaphragm' ? "#b47850" : "#505050"} strokeWidth={hoveredElement === 'end_diaphragm' ? "4" : "2"} />
          <line x1={leftBearingX + 2} y1={girderPositions[0]} x2={leftBearingX + 2} y2={girderPositions[girderPositions.length - 1]} stroke={hoveredElement === 'end_diaphragm' ? "#b47850" : "#505050"} strokeWidth={hoveredElement === 'end_diaphragm' ? "4" : "2"} />
          
          <line x1={rightBearingX - 2} y1={girderPositions[0]} x2={rightBearingX - 2} y2={girderPositions[girderPositions.length - 1]} stroke={hoveredElement === 'end_diaphragm' ? "#b47850" : "#505050"} strokeWidth={hoveredElement === 'end_diaphragm' ? "4" : "2"} />
          <line x1={rightBearingX + 2} y1={girderPositions[0]} x2={rightBearingX + 2} y2={girderPositions[girderPositions.length - 1]} stroke={hoveredElement === 'end_diaphragm' ? "#b47850" : "#505050"} strokeWidth={hoveredElement === 'end_diaphragm' ? "4" : "2"} />
        </g>
      )}

      {/* Girders (Horizontal lines) */}
      {girderPositions.map((y, idx) => {
        const isHovered = hoveredElement === 'girder';
        return (
          <g key={`girder-group-${idx}`} onMouseEnter={() => setHoveredElement('girder')} onMouseLeave={() => setHoveredElement(null)} style={{ cursor: "pointer" }}>
            <line
              x1={leftBearingX - 10}
              y1={y}
              x2={rightBearingX + 10}
              y2={y}
              stroke={isHovered ? "#508cdc" : "#b8b8b8"}
              strokeWidth={isHovered ? "4.5" : "3.5"}
            />
            {/* Girder center lines */}
            <line
              x1={leftBearingX - 10}
              y1={y}
              x2={rightBearingX + 10}
              y2={y}
              stroke="#888"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* CL of Bearing (Red Dashed Lines) */}
      <g onMouseEnter={() => setHoveredElement('bearing')} onMouseLeave={() => setHoveredElement(null)} style={{ cursor: "pointer" }}>
        <rect x={leftBearingX - 10} y={topExtent - 15} width={20} height={botExtent - topExtent + 30} fill="transparent" />
        <rect x={rightBearingX - 10} y={topExtent - 15} width={20} height={botExtent - topExtent + 30} fill="transparent" />
        <line x1={leftBearingX} y1={topExtent - 15} x2={leftBearingX} y2={botExtent + 15} stroke={hoveredElement === 'bearing' ? "#ff5050" : "red"} strokeWidth={hoveredElement === 'bearing' ? "2.5" : "1.5"} strokeDasharray="6,4" />
        <line x1={rightBearingX} y1={topExtent - 15} x2={rightBearingX} y2={botExtent + 15} stroke={hoveredElement === 'bearing' ? "#ff5050" : "red"} strokeWidth={hoveredElement === 'bearing' ? "2.5" : "1.5"} strokeDasharray="6,4" />
      </g>
      
      <text x={leftBearingX} y={topExtent - 20} fontSize="10" fill="red" fontWeight="bold" textAnchor="middle">CL of Bearing</text>
      <text x={rightBearingX} y={topExtent - 20} fontSize="10" fill="red" fontWeight="bold" textAnchor="middle">CL of Bearing</text>

      {/* Dimensions */}
      
      {/* Span Length */}
      <g>
        <line x1={leftBearingX} y1={botExtent + 25} x2={rightBearingX} y2={botExtent + 25} stroke="#000" strokeWidth="1" />
        <line x1={leftBearingX} y1={botExtent + 20} x2={leftBearingX} y2={botExtent + 30} stroke="#000" strokeWidth="1" />
        <line x1={rightBearingX} y1={botExtent + 20} x2={rightBearingX} y2={botExtent + 30} stroke="#000" strokeWidth="1" />
        <polygon points={`${leftBearingX},${botExtent + 25} ${leftBearingX + 6},${botExtent + 23} ${leftBearingX + 6},${botExtent + 27}`} fill="#000" />
        <polygon points={`${rightBearingX},${botExtent + 25} ${rightBearingX - 6},${botExtent + 23} ${rightBearingX - 6},${botExtent + 27}`} fill="#000" />
        {/* White background for text */}
        <rect x={W/2 - 50} y={botExtent + 18} width={100} height={14} fill="#fff" />
        <text x={W/2} y={botExtent + 28} fontSize="10" fill="#000" fontWeight="bold" textAnchor="middle">
          Span Length = {spanLength.toFixed(1)} m
        </text>
      </g>

      {/* Bracing Spacing */}
      {numGirders > 1 && numBraces > 1 && (
        <g>
          <line x1={leftBearingX} y1={botExtent + 45} x2={leftBearingX + visualBraceSpacing} y2={botExtent + 45} stroke="#000" strokeWidth="1" />
          <line x1={leftBearingX} y1={botExtent + 40} x2={leftBearingX} y2={botExtent + 50} stroke="#000" strokeWidth="1" />
          <line x1={leftBearingX + visualBraceSpacing} y1={botExtent + 40} x2={leftBearingX + visualBraceSpacing} y2={botExtent + 50} stroke="#000" strokeWidth="1" />
          <polygon points={`${leftBearingX},${botExtent + 45} ${leftBearingX + 6},${botExtent + 43} ${leftBearingX + 6},${botExtent + 47}`} fill="#000" />
          <polygon points={`${leftBearingX + visualBraceSpacing},${botExtent + 45} ${leftBearingX + visualBraceSpacing - 6},${botExtent + 43} ${leftBearingX + visualBraceSpacing - 6},${botExtent + 47}`} fill="#000" />
          
          <text x={leftBearingX + visualBraceSpacing / 2} y={botExtent + 58} fontSize="9" fill="#000" fontWeight="bold" textAnchor="middle">
            Bracing Spacing = {bracingSpacing.toFixed(2)} m
          </text>
        </g>
      )}

      {/* Girder Spacing */}
      {numGirders > 1 && (
        <g>
          <line x1={rightBearingX + 25} y1={girderPositions[0]} x2={rightBearingX + 25} y2={girderPositions[1]} stroke="#000" strokeWidth="1" />
          <line x1={rightBearingX + 20} y1={girderPositions[0]} x2={rightBearingX + 30} y2={girderPositions[0]} stroke="#000" strokeWidth="1" />
          <line x1={rightBearingX + 20} y1={girderPositions[1]} x2={rightBearingX + 30} y2={girderPositions[1]} stroke="#000" strokeWidth="1" />
          <polygon points={`${rightBearingX + 25},${girderPositions[0]} ${rightBearingX + 23},${girderPositions[0] + 6} ${rightBearingX + 27},${girderPositions[0] + 6}`} fill="#000" />
          <polygon points={`${rightBearingX + 25},${girderPositions[1]} ${rightBearingX + 23},${girderPositions[1] - 6} ${rightBearingX + 27},${girderPositions[1] - 6}`} fill="#000" />
          
          <text x={rightBearingX + 35} y={(girderPositions[0] + girderPositions[1]) / 2 - 4} fontSize="9" fill="#1b7d34" fontWeight="bold" textAnchor="start">
            Girder
          </text>
          <text x={rightBearingX + 35} y={(girderPositions[0] + girderPositions[1]) / 2 + 6} fontSize="9" fill="#1b7d34" fontWeight="bold" textAnchor="start">
            Spacing
          </text>
          <text x={rightBearingX + 35} y={(girderPositions[0] + girderPositions[1]) / 2 + 16} fontSize="9" fill="#1b7d34" fontWeight="bold" textAnchor="start">
            = {girderSpacing.toFixed(2)} m
          </text>
        </g>
      )}

      {/* Hover Labels (Only visible when hovered) */}
      
      {/* Girder Label */}
      {hoveredElement === 'girder' && girderPositions.length > 0 && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={W / 2} y1={girderPositions[0]} x2={W / 2} y2={girderPositions[0] - 20} stroke="#888" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={W / 2} cy={girderPositions[0]} r="2" fill="#888" />
          <rect x={W / 2 - 25} y={girderPositions[0] - 32} width={50} height={14} fill="rgba(255,255,255,0.9)" />
          <text x={W / 2} y={girderPositions[0] - 22} fontSize="10" fill="#006400" fontWeight="bold" textAnchor="middle">Girder</text>
        </g>
      )}

      {/* Cross Bracing Label */}
      {hoveredElement === 'cross_bracing' && numGirders > 1 && numBraces > 1 && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={leftBearingX + visualBraceSpacing} y1={(girderPositions[0] + girderPositions[1]) / 2} x2={leftBearingX + visualBraceSpacing} y2={(girderPositions[0] + girderPositions[1]) / 2 - 20} stroke="#888" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={leftBearingX + visualBraceSpacing} cy={(girderPositions[0] + girderPositions[1]) / 2} r="2" fill="#888" />
          <rect x={leftBearingX + visualBraceSpacing - 40} y={(girderPositions[0] + girderPositions[1]) / 2 - 32} width={80} height={14} fill="rgba(255,255,255,0.9)" />
          <text x={leftBearingX + visualBraceSpacing} y={(girderPositions[0] + girderPositions[1]) / 2 - 22} fontSize="10" fill="#c86400" fontWeight="bold" textAnchor="middle">Cross Bracing</text>
        </g>
      )}

      {/* End Diaphragm Label */}
      {hoveredElement === 'end_diaphragm' && numGirders > 1 && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={leftBearingX} y1={(girderPositions[0] + girderPositions[1]) / 2} x2={leftBearingX} y2={(girderPositions[0] + girderPositions[1]) / 2 - 20} stroke="#888" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={leftBearingX} cy={(girderPositions[0] + girderPositions[1]) / 2} r="2" fill="#888" />
          <rect x={leftBearingX - 45} y={(girderPositions[0] + girderPositions[1]) / 2 - 32} width={90} height={14} fill="rgba(255,255,255,0.9)" />
          <text x={leftBearingX} y={(girderPositions[0] + girderPositions[1]) / 2 - 22} fontSize="10" fill="#8c4600" fontWeight="bold" textAnchor="middle">End Diaphragm</text>
        </g>
      )}

    </svg>
  );
}
