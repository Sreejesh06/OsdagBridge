import React from "react";

interface SupportDetailCADWidgetProps {
  bearingLength?: number;
}

export default function SupportDetailCADWidget({
  bearingLength = 400,
}: SupportDetailCADWidgetProps) {
  const W = 400;
  const H = 280;
  
  // Scale factor to fit inside the viewBox
  const cx = W * 0.40;
  
  // Concrete Block
  const concW = W * 0.35;
  const concLeft = cx - concW / 2;
  const concRight = cx + concW / 2;
  const concTop = H * 0.65;
  const concBot = H * 0.85;

  // Bearing Plate Width (dynamic but visually capped)
  // Max visually is concW * 0.90, min is like 20px
  const maxBpPx = concW * 0.90;
  const clampedBearingLen = Math.max(50, Math.min(600, Number(bearingLength) || 400));
  const bpPx = maxBpPx * (clampedBearingLen / 600.0);
  const bpLeft = cx - bpPx / 2;
  const bpRight = cx + bpPx / 2;

  // Bearing Plate Y
  const bearingTop = H * 0.58;
  const bearingBot = concTop;

  // Flanges
  const flLeft = bpLeft;
  const flRight = cx + W * 0.35; // Extends to the right
  
  const tfTop = H * 0.15;
  const tfBot = tfTop + H * 0.03;
  const bfTop = bearingTop - H * 0.03;
  const bfBot = bearingTop;

  // End Bearing Stiffener
  const stiffWidth = W * 0.025;
  const stiffX = cx;
  const stiffLeft = stiffX - stiffWidth / 2;
  const stiffRight = stiffX + stiffWidth / 2;

  // Zigzag x
  const zigzagX = flRight;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
      
      {/* Define Patterns */}
      <defs>
        <pattern id="concrete" patternUnits="userSpaceOnUse" width="40" height="40">
          <rect width="40" height="40" fill="#e1e1e1" />
          <path d="M5,5 l3,2 l-1,4 Z" fill="#999" />
          <path d="M15,25 l4,-1 l2,3 l-3,2 Z" fill="#888" />
          <path d="M30,10 l2,5 l-4,2 Z" fill="#777" />
          <circle cx="25" cy="5" r="1.5" fill="#555" />
          <circle cx="8" cy="20" r="1" fill="#666" />
          <circle cx="35" cy="30" r="2" fill="#555" />
          <circle cx="20" cy="15" r="1" fill="#444" />
        </pattern>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#aaaaaa" strokeWidth="2.5" />
        </pattern>
      </defs>

      {/* Start Vertical Line (End of girder) */}
      <line x1={bpLeft} y1={tfTop} x2={bpLeft} y2={bearingBot} stroke="#000" strokeWidth="1.5" />

      {/* Top Flange */}
      <line x1={flLeft} y1={tfTop} x2={flRight} y2={tfTop} stroke="#000" strokeWidth="1" />
      <line x1={flLeft} y1={tfBot} x2={flRight} y2={tfBot} stroke="#000" strokeWidth="1" />

      {/* End Bearing Stiffener */}
      <rect x={stiffLeft} y={tfBot} width={stiffWidth} height={bfTop - tfBot} fill="#fff" stroke="#000" strokeWidth="1" />

      {/* Bottom Flange */}
      <line x1={flLeft} y1={bfTop} x2={flRight} y2={bfTop} stroke="#000" strokeWidth="1" />
      <line x1={flLeft} y1={bfBot} x2={flRight} y2={bfBot} stroke="#000" strokeWidth="1" />

      {/* Bearing Plate */}
      <rect x={bpLeft} y={bearingTop} width={bpRight - bpLeft} height={bearingBot - bearingTop} fill="url(#hatch)" stroke="#969696" strokeWidth="2" />

      {/* Concrete Block */}
      <rect x={concLeft} y={concTop} width={concW} height={concBot - concTop} fill="url(#concrete)" stroke="#000" strokeWidth="1" />

      {/* Zigzags */}
      {/* Right side vertical zigzag */}
      <polyline
        points={`
          ${zigzagX},${tfTop - 10}
          ${zigzagX},${tfTop + 20}
          ${zigzagX + 8},${tfTop + 35}
          ${zigzagX - 8},${tfTop + 50}
          ${zigzagX + 8},${tfTop + 65}
          ${zigzagX - 8},${tfTop + 80}
          ${zigzagX},${tfTop + 95}
          ${zigzagX},${bfBot + 10}
        `}
        fill="none"
        stroke="#000"
        strokeWidth="1"
      />
      {/* Bottom side horizontal zigzag */}
      <polyline
        points={`
          ${concLeft - 10},${concBot}
          ${concLeft + 20},${concBot}
          ${concLeft + 35},${concBot + 8}
          ${concLeft + 50},${concBot - 8}
          ${concLeft + 65},${concBot + 8}
          ${concLeft + 80},${concBot - 8}
          ${concLeft + 95},${concBot}
          ${concRight + 10},${concBot}
        `}
        fill="none"
        stroke="#000"
        strokeWidth="1"
      />

      {/* Dimension Arrow for Bearing Length */}
      <g>
        <line x1={bpLeft} y1={bearingBot} x2={bpLeft} y2={concBot + 25} stroke="#000" strokeWidth="1" strokeDasharray="4,4" />
        <line x1={bpRight} y1={bearingBot} x2={bpRight} y2={concBot + 25} stroke="#000" strokeWidth="1" strokeDasharray="4,4" />
        
        <line x1={bpLeft} y1={concBot + 20} x2={bpRight} y2={concBot + 20} stroke="#000" strokeWidth="1" />
        <line x1={bpLeft} y1={concBot + 15} x2={bpLeft} y2={concBot + 25} stroke="#000" strokeWidth="1" />
        <line x1={bpRight} y1={concBot + 15} x2={bpRight} y2={concBot + 25} stroke="#000" strokeWidth="1" />
        
        <polygon points={`${bpLeft},${concBot + 20} ${bpLeft + 6},${concBot + 18} ${bpLeft + 6},${concBot + 22}`} fill="#000" />
        <polygon points={`${bpRight},${concBot + 20} ${bpRight - 6},${concBot + 18} ${bpRight - 6},${concBot + 22}`} fill="#000" />
        
        <text x={cx} y={concBot + 38} fontSize="9" fill="#000" textAnchor="middle" fontWeight="bold">
          <tspan x={cx} dy="0">Bearing</tspan>
          <tspan x={cx} dy="12">length = {bearingLength} mm</tspan>
        </text>
      </g>

      {/* Labels & Leaders */}
      {/* End bearing stiffener */}
      <g>
        <line x1={stiffRight + 70} y1={H * 0.25} x2={stiffRight + 5} y2={H * 0.45} stroke="#000" strokeWidth="1" />
        <polygon points={`${stiffRight + 5},${H * 0.45} ${stiffRight + 12},${H * 0.43} ${stiffRight + 8},${H * 0.40}`} fill="#000" />
        <rect x={stiffRight + 70} y={H * 0.25 - 25} width={70} height={26} fill="rgba(255,255,255,0.8)" />
        <text x={stiffRight + 72} y={H * 0.25 - 13} fontSize="10" fontWeight="bold">
          <tspan x={stiffRight + 72} dy="0">End bearing</tspan>
          <tspan x={stiffRight + 72} dy="12">stiffener</tspan>
        </text>
      </g>

      {/* Plate girder */}
      <g>
        <line x1={zigzagX + 50} y1={H * 0.55} x2={zigzagX - 10} y2={H * 0.45} stroke="#000" strokeWidth="1" />
        <polygon points={`${zigzagX - 10},${H * 0.45} ${zigzagX - 3},${H * 0.45} ${zigzagX - 7},${H * 0.48}`} fill="#000" />
        <rect x={zigzagX + 50} y={H * 0.55 - 12} width={70} height={14} fill="rgba(255,255,255,0.8)" />
        <text x={zigzagX + 52} y={H * 0.55} fontSize="10" fontWeight="bold">Plate girder</text>
      </g>

      {/* Bearing plate */}
      <g>
        <line x1={bpRight + 50} y1={H * 0.70} x2={bpRight - 5} y2={bearingTop + (bearingBot - bearingTop) / 2} stroke="#000" strokeWidth="1" />
        <polygon points={`${bpRight - 5},${bearingTop + (bearingBot - bearingTop) / 2} ${bpRight + 2},${bearingTop + (bearingBot - bearingTop) / 2 - 4} ${bpRight + 2},${bearingTop + (bearingBot - bearingTop) / 2 + 4}`} fill="#000" />
        <rect x={bpRight + 50} y={H * 0.70 - 12} width={75} height={14} fill="rgba(255,255,255,0.8)" />
        <text x={bpRight + 52} y={H * 0.70} fontSize="10" fontWeight="bold">Bearing plate</text>
      </g>

    </svg>
  );
}
