import React, { useState, useEffect } from "react";
import { Label, Input, Select } from "../../SharedComponents";
import { STANDARD_ANGLE_SECTIONS, STANDARD_CHANNEL_SECTIONS } from "../../../../constants/memberConstants";
import { useBridgeStore } from "../../../../../store/bridgeStore";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CrossBracingDetailsTabProps {
  memberProps: any;
  updateBracingField: (pairId: string, field: string, value: any) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SECTION_TYPE_OPTIONS = [
  "Angle",
  "Double Angle (Long Leg)",
  "Double Angle (Short Leg)",
  "Channel",
  "Double Channel",
];

const BRACING_TYPE_OPTIONS = ["K-Bracing", "X-Bracing"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isChannelType(typeLabel: string): boolean {
  return typeLabel === "Channel" || typeLabel === "Double Channel";
}

/** Derive girder pairs from memberProps in "G1 to G2" format (desktop compatible). */
function deriveGirderPairs(memberProps: any): string[] {
  const keys = Object.keys(memberProps?.cross_bracing || {});
  if (keys.length > 0) return keys;
  // Fallback: derive from girder_details
  const girders = Object.keys(memberProps?.girder_details || {}).sort();
  if (girders.length < 2) return ["G1 to G2"];
  return girders.slice(0, -1).map((g, i) => `${g} to ${girders[i + 1]}`);
}

/** Parse the pair label to get the pair index (1-based) for member ID computation. */
function pairIndex(pairLabel: string): number {
  const match = pairLabel.match(/G(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/** Compute number of cross-bracing members from span and spacing. */
function computeMemberCount(totalSpanM: number, spacingM: number): number {
  if (!totalSpanM || !spacingM || spacingM <= 0) return 1;
  return Math.max(1, Math.floor(totalSpanM / spacingM - 1 + 1e-9));
}

/** Format member ID display string, e.g. "B1M1" or "B1M1 to B1M5". */
function formatMemberId(pairIdx: number, count: number): string {
  if (count <= 1) return `B${pairIdx}M1`;
  return `B${pairIdx}M1 to B${pairIdx}M${count}`;
}

// ─── CAD Layout Widget (SVG) ────────────────────────────────────────────────────
interface BracingLayoutProps {
  bracingType: string;
  topChord: boolean;
  bottomChord: boolean;
  memberLabel: string;
  pairLabel: string;
}

function BracingLayoutSvg({ bracingType, topChord, bottomChord, memberLabel, pairLabel }: BracingLayoutProps) {
  const W = 300, H = 170;
  const xLeft = 60, xRight = 240;
  const yTop = 20, yBottom = 125;
  const fw = 36, ft = 7, wt = 6;

  // Connection work points at web outer faces
  const xLC = xLeft + wt / 2;
  const xRC = xRight - wt / 2;
  const strutOff = 11;
  const yTWP = topChord ? yTop + strutOff : yTop + 14;
  const yBWP = bottomChord ? yBottom - strutOff : yBottom - 14;

  // Girder pair labels
  let leftGirder = "G1", rightGirder = "G2";
  const sep = pairLabel.includes(" to ") ? " to " : "-";
  const parts = pairLabel.split(sep);
  if (parts.length === 2) {
    leftGirder = parts[0].trim();
    rightGirder = parts[1].trim();
  }

  const isK = bracingType === "K-Bracing";
  const midX = (xLC + xRC) / 2;
  
  // Apex switching logic
  const isTopApex = topChord && !bottomChord;
  const apexY = isTopApex ? yTWP : yBWP;
  const baseY = isTopApex ? yBWP : yTWP;

  return (
    <svg width={W} height={H} style={{ display: "block", width: "100%", height: "100%" }} viewBox={`0 0 ${W} ${H}`}>
      {/* White background */}
      <rect x={0} y={0} width={W} height={H} fill="#ffffff" />

      {/* Top chord line */}
      {topChord && <line x1={xLC} y1={yTWP} x2={xRC} y2={yTWP} stroke="#000" strokeWidth={2} />}

      {/* Bottom chord line */}
      {bottomChord && <line x1={xLC} y1={yBWP} x2={xRC} y2={yBWP} stroke="#000" strokeWidth={2} />}

      {/* Bracing diagonals */}
      {isK ? (
        <>
          <line x1={xLC} y1={baseY} x2={midX} y2={apexY} stroke="#000" strokeWidth={2} />
          <line x1={xRC} y1={baseY} x2={midX} y2={apexY} stroke="#000" strokeWidth={2} />
        </>
      ) : (
        <>
          <line x1={xLC} y1={yTWP} x2={xRC} y2={yBWP} stroke="#000" strokeWidth={2} />
          <line x1={xRC} y1={yTWP} x2={xLC} y2={yBWP} stroke="#000" strokeWidth={2} />
        </>
      )}

      {/* Left I-Girder */}
      {/* Top flange */}
      <rect x={xLeft - fw / 2} y={yTop - ft} width={fw} height={ft} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Bottom flange */}
      <rect x={xLeft - fw / 2} y={yBottom} width={fw} height={ft} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Web */}
      <rect x={xLeft - wt / 2} y={yTop} width={wt} height={yBottom - yTop} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Right I-Girder */}
      <rect x={xRight - fw / 2} y={yTop - ft} width={fw} height={ft} fill="none" stroke="#000" strokeWidth={1.5} />
      <rect x={xRight - fw / 2} y={yBottom} width={fw} height={ft} fill="none" stroke="#000" strokeWidth={1.5} />
      <rect x={xRight - wt / 2} y={yTop} width={wt} height={yBottom - yTop} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Labels at bottom inside rounded boxes */}
      {(() => {
        function LabelBox({ text, cx, cy, fontSize, fontWeight = "normal" }: { text: string; cx: number; cy: number; fontSize: number; fontWeight?: string }) {
          if (!text) return null;
          const padX = 6;
          const padY = 3;
          const charWidth = fontSize * 0.6;
          const txtW = text.length * charWidth;
          const txtH = fontSize * 1.2;
          const boxW = txtW + 2 * padX;
          const boxH = txtH + 2 * padY;
          const x = cx - boxW / 2;
          const y = cy - boxH / 2;

          return (
            <g>
              <rect
                x={x}
                y={y}
                width={boxW}
                height={boxH}
                rx={4}
                ry={4}
                fill="rgba(255, 255, 255, 0.88)"
                stroke="#bbbbbb"
                strokeWidth={1}
              />
              <text
                x={cx}
                y={cy + txtH / 2 - 2}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={fontWeight}
                fill="#4b4b4b"
              >
                {text}
              </text>
            </g>
          );
        }

        const labelY = yBottom + ft + 16;
        return (
          <>
            <LabelBox text={`Girder ${leftGirder}`} cx={xLeft} cy={labelY} fontSize={8} fontWeight="bold" />
            <LabelBox text={memberLabel || "B1M1"} cx={midX} cy={labelY} fontSize={11} fontWeight="bold" />
            <LabelBox text={`Girder ${rightGirder}`} cx={xRight} cy={labelY} fontSize={8} fontWeight="bold" />
          </>
        );
      })()}
    </svg>
  );
}

// ─── Helpers for parsing designations ───────────────────────────
function parseAngleDesignation(designation: string) {
  const cleaned = designation.replace(/ISA\s*/i, "").trim();
  const parts = cleaned.split("x");
  if (parts.length === 2) {
    const legs = parts[0];
    const thickness = parseFloat(parts[1]) || 0;
    const halfLen = legs.length / 2;
    const leg1 = parseFloat(legs.substring(0, halfLen)) || 0;
    const leg2 = parseFloat(legs.substring(halfLen)) || 0;
    return { leg1, leg2, thickness };
  }
  return { leg1: 50, leg2: 50, thickness: 6 };
}

const CHANNEL_DB: Record<string, { d: number; b: number; tw: number; tf: number }> = {
  "ISMC 100": { d: 100, b: 50, tw: 5.0, tf: 7.7 },
  "ISMC 125": { d: 125, b: 65, tw: 5.3, tf: 8.2 },
  "ISMC 150": { d: 150, b: 75, tw: 5.7, tf: 9.0 },
  "ISMC 175": { d: 175, b: 75, tw: 6.0, tf: 10.2 },
  "ISMC 200": { d: 200, b: 75, tw: 6.2, tf: 11.4 },
  "ISMC 250": { d: 250, b: 80, tw: 7.2, tf: 14.1 },
  "ISMC 300": { d: 300, b: 90, tw: 7.8, tf: 13.6 },
  "ISMC 400": { d: 400, b: 100, tw: 8.8, tf: 15.3 },
};

function parseChannelDesignation(designation: string) {
  const norm = designation.toUpperCase().replace(/\s+/g, "");
  const match = norm.match(/(ISMC|MC|JC|LC|MPC)(\d+)/);
  if (match) {
    const name = "ISMC " + match[2];
    return CHANNEL_DB[name] || { d: 100, b: 50, tw: 5.0, tf: 7.7 };
  }
  return { d: 100, b: 50, tw: 5.0, tf: 7.7 };
}

// ─── Section Shape Preview with dimensions ─────────────────────────────────────
function SectionShapePreview({ sectionType, designation }: { sectionType: string; designation: string }) {
  if (!designation) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 110, fontSize: 11, color: "#6f6f6f", fontWeight: "bold", fontFamily: '"Ubuntu Sans", sans-serif' }}>
        No section
      </div>
    );
  }

  const isChannel = isChannelType(sectionType);
  const isDouble = sectionType.startsWith("Double");
  
  const W = 220, H = 110;
  const fillStyle = { fill: "#fefefe", stroke: "#1b1b1b", strokeWidth: 1.5 };
  const dimStyle = { stroke: "#90AF13", strokeWidth: 1 };
  const textStyle = { fontSize: 9, fill: "#0f0f0f", fontFamily: '"Ubuntu Sans", sans-serif' };

  if (!isChannel) {
    // Angle Section
    const { leg1, leg2, thickness } = parseAngleDesignation(designation);
    
    if (isDouble) {
      // Double Angle connected back-to-back vertical
      const L = 36;
      const t = Math.max(3, Math.min(8, (thickness / leg1) * L));
      const x0 = 110;
      const y0 = 85;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
          {/* Left angle */}
          <polygon
            points={`${x0},${y0} ${x0-L},${y0} ${x0-L},${y0-t} ${x0-t},${y0-t} ${x0-t},${y0-L} ${x0},${y0-L}`}
            {...fillStyle}
          />
          {/* Right angle */}
          <polygon
            points={`${x0},${y0} ${x0+L},${y0} ${x0+L},${y0-t} ${x0+t},${y0-t} ${x0+t},${y0-L} ${x0},${y0-L}`}
            {...fillStyle}
          />
          
          {/* Height H Dimension */}
          <line x1={45} y1={y0} x2={45} y2={y0-L} {...dimStyle} />
          {/* Arrowheads for Height */}
          <polygon points={`45,${y0} 43,${y0-8} 47,${y0-8}`} fill="#90AF13" />
          <polygon points={`45,${y0-L} 43,${y0-L+8} 47,${y0-L+8}`} fill="#90AF13" />
          <text x={40} y={y0 - L/2 + 3} textAnchor="end" {...textStyle}>H = {leg2} mm</text>

          {/* Width W Dimension */}
          <line x1={x0-L} y1={97} x2={x0+L} y2={97} {...dimStyle} />
          {/* Arrowheads for Width */}
          <polygon points={`${x0-L},97 ${x0-L+8},95 ${x0-L+8},99`} fill="#90AF13" />
          <polygon points={`${x0+L},97 ${x0+L-8},95 ${x0+L-8},99`} fill="#90AF13" />
          <text x={x0} y={106} textAnchor="middle" {...textStyle}>W = {leg1 * 2} mm</text>

          {/* Thickness t Dimension */}
          <line x1={x0 - 12} y1={25} x2={x0 + t + 12} y2={25} {...dimStyle} />
          {/* Arrowheads pointing in */}
          <polygon points={`${x0},25 ${x0-8},23 ${x0-8},27`} fill="#90AF13" />
          <polygon points={`${x0+t},25 ${x0+t+8},23 ${x0+t+8},27`} fill="#90AF13" />
          <text x={x0 + t/2} y={17} textAnchor="middle" {...textStyle}>t = {thickness} mm</text>
        </svg>
      );
    }

    // Single Angle Section
    const L = 45;
    const t = Math.max(3, Math.min(10, (thickness / leg1) * L));
    const x0 = 100;
    const y0 = 85;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
        {/* Single angle L */}
        <polygon
          points={`${x0},${y0} ${x0+L},${y0} ${x0+L},${y0-t} ${x0+t},${y0-t} ${x0+t},${y0-L} ${x0},${y0-L}`}
          {...fillStyle}
        />
        
        {/* Height H Dimension */}
        <line x1={75} y1={y0} x2={75} y2={y0-L} {...dimStyle} />
        {/* Arrowheads for Height */}
        <polygon points={`75,${y0} 73,${y0-8} 77,${y0-8}`} fill="#90AF13" />
        <polygon points={`75,${y0-L} 73,${y0-L+8} 77,${y0-L+8}`} fill="#90AF13" />
        <text x={70} y={y0 - L/2 + 3} textAnchor="end" {...textStyle}>H = {leg2} mm</text>

        {/* Width W Dimension */}
        <line x1={x0} y1={25} x2={x0+L} y2={25} {...dimStyle} />
        {/* Arrowheads for Width */}
        <polygon points={`${x0},25 ${x0+8},23 ${x0+8},27`} fill="#90AF13" />
        <polygon points={`${x0+L},25 ${x0+L-8},23 ${x0+L-8},27`} fill="#90AF13" />
        <text x={x0 + L/2} y={17} textAnchor="middle" {...textStyle}>W = {leg1} mm</text>

        {/* Thickness t Dimension */}
        <line x1={x0 - 12} y1={97} x2={x0 + t + 12} y2={97} {...dimStyle} />
        {/* Arrowheads pointing in */}
        <polygon points={`${x0},97 ${x0-8},95 ${x0-8},99`} fill="#90AF13" />
        <polygon points={`${x0+t},97 ${x0+t+8},95 ${x0+t+8},99`} fill="#90AF13" />
        <text x={x0 + t/2} y={106} textAnchor="middle" {...textStyle}>t = {thickness} mm</text>
      </svg>
    );
  }

  // Channel Section
  const { d, b, tw, tf } = parseChannelDesignation(designation);
  const D_pixels = 50;
  const B_pixels = 30;
  const tw_pixels = Math.max(3, Math.min(8, (tw / b) * B_pixels));
  const tf_pixels = Math.max(3, Math.min(10, (tf / d) * D_pixels));

  if (isDouble) {
    // Double Channel connected back-to-back
    const x0 = 110;
    const y0 = 85;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
        {/* Left Channel */}
        <polygon
          points={`${x0},${y0} ${x0-B_pixels},${y0} ${x0-B_pixels},${y0-tf_pixels} ${x0-tw_pixels},${y0-tf_pixels} ${x0-tw_pixels},${y0-D_pixels+tf_pixels} ${x0-B_pixels},${y0-D_pixels+tf_pixels} ${x0-B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
          {...fillStyle}
        />
        {/* Right Channel */}
        <polygon
          points={`${x0},${y0} ${x0+B_pixels},${y0} ${x0+B_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
          {...fillStyle}
        />
        
        {/* Depth D Dimension */}
        <line x1={50} y1={y0} x2={50} y2={y0-D_pixels} {...dimStyle} />
        {/* Arrowheads for Depth */}
        <polygon points={`50,${y0} 48,${y0-8} 52,${y0-8}`} fill="#90AF13" />
        <polygon points={`50,${y0-D_pixels} 48,${y0-D_pixels+8} 52,${y0-D_pixels+8}`} fill="#90AF13" />
        <text x={45} y={y0 - D_pixels/2 + 3} textAnchor="end" {...textStyle}>D = {d} mm</text>

        {/* Flange Width B Dimension */}
        <line x1={x0-B_pixels} y1={97} x2={x0} y2={97} {...dimStyle} />
        {/* Arrowheads for Flange Width */}
        <polygon points={`${x0-B_pixels},97 ${x0-B_pixels+8},95 ${x0-B_pixels+8},99`} fill="#90AF13" />
        <polygon points={`${x0},97 ${x0-8},95 ${x0-8},99`} fill="#90AF13" />
        <text x={x0 - B_pixels/2} y={106} textAnchor="middle" {...textStyle}>B = {b} mm</text>

        {/* Web thickness tw Dimension */}
        <line x1={x0 - tw_pixels - 12} y1={25} x2={x0 + 12} y2={25} {...dimStyle} />
        {/* Arrowheads pointing in */}
        <polygon points={`${x0-tw_pixels},25 ${x0-tw_pixels-8},23 ${x0-tw_pixels-8},27`} fill="#90AF13" />
        <polygon points={`${x0},25 ${x0+8},23 ${x0+8},27`} fill="#90AF13" />
        <text x={x0 - tw_pixels/2} y={17} textAnchor="middle" {...textStyle}>tw = {tw} mm</text>

        {/* Flange thickness tf Dimension */}
        <line x1={150} y1={y0 - D_pixels - 12} x2={150} y2={y0 - D_pixels + tf_pixels + 12} {...dimStyle} />
        {/* Arrowheads pointing in */}
        <polygon points={`150,${y0-D_pixels} 148,${y0-D_pixels-8} 152,${y0-D_pixels-8}`} fill="#90AF13" />
        <polygon points={`150,${y0-D_pixels+tf_pixels} 148,${y0-D_pixels+tf_pixels+8} 152,${y0-D_pixels+tf_pixels+8}`} fill="#90AF13" />
        <text x={156} y={y0 - D_pixels + tf_pixels/2 + 3} textAnchor="start" {...textStyle}>tf = {tf} mm</text>
      </svg>
    );
  }

  // Single Channel Section
  const x0 = 100;
  const y0 = 85;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
      {/* Single Channel */}
      <polygon
        points={`${x0},${y0} ${x0+B_pixels},${y0} ${x0+B_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
        {...fillStyle}
      />
      
      {/* Depth D Dimension */}
      <line x1={75} y1={y0} x2={75} y2={y0-D_pixels} {...dimStyle} />
      {/* Arrowheads for Depth */}
      <polygon points={`75,${y0} 73,${y0-8} 77,${y0-8}`} fill="#90AF13" />
      <polygon points={`75,${y0-D_pixels} 73,${y0-D_pixels+8} 77,${y0-D_pixels+8}`} fill="#90AF13" />
      <text x={70} y={y0 - D_pixels/2 + 3} textAnchor="end" {...textStyle}>D = {d} mm</text>

      {/* Flange Width B Dimension */}
      <line x1={x0} y1={97} x2={x0+B_pixels} y2={97} {...dimStyle} />
      {/* Arrowheads for Flange Width */}
      <polygon points={`${x0},97 ${x0+8},95 ${x0+8},99`} fill="#90AF13" />
      <polygon points={`${x0+B_pixels},97 ${x0+B_pixels-8},95 ${x0+B_pixels-8},99`} fill="#90AF13" />
      <text x={x0 + B_pixels/2} y={106} textAnchor="middle" {...textStyle}>B = {b} mm</text>

      {/* Web thickness tw Dimension */}
      <line x1={x0 - 12} y1={25} x2={x0 + tw_pixels + 12} y2={25} {...dimStyle} />
      {/* Arrowheads pointing in */}
      <polygon points={`${x0},25 ${x0-8},23 ${x0-8},27`} fill="#90AF13" />
      <polygon points={`${x0+tw_pixels},25 ${x0+tw_pixels+8},23 ${x0+tw_pixels+8},27`} fill="#90AF13" />
      <text x={x0 + tw_pixels/2} y={17} textAnchor="middle" {...textStyle}>tw = {tw} mm</text>

      {/* Flange thickness tf Dimension */}
      <line x1={140} y1={y0 - D_pixels - 12} x2={140} y2={y0 - D_pixels + tf_pixels + 12} {...dimStyle} />
      {/* Arrowheads pointing in */}
      <polygon points={`140,${y0-D_pixels} 138,${y0-D_pixels-8} 142,${y0-D_pixels-8}`} fill="#90AF13" />
      <polygon points={`140,${y0-D_pixels+tf_pixels} 138,${y0-D_pixels+tf_pixels+8} 142,${y0-D_pixels+tf_pixels+8}`} fill="#90AF13" />
      <text x={146} y={y0 - D_pixels + tf_pixels/2 + 3} textAnchor="start" {...textStyle}>tf = {tf} mm</text>
    </svg>
  );
}

// ─── Section Preview Box ────────────────────────────────────────────────────────
function SectionPreviewBox({ title, sectionType, designation, visible }: { title: string; sectionType: string; designation: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 8 }}>{title}</div>
      <SectionShapePreview sectionType={sectionType} designation={designation} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CrossBracingDetailsTab({
  memberProps,
  updateBracingField,
}: CrossBracingDetailsTabProps) {
  const designMode = useBridgeStore((state) => state.designMode);
  const setDesignMode = useBridgeStore((state) => state.setDesignMode);
  const isCustom = designMode === "Custom";

  const angleOptions = STANDARD_ANGLE_SECTIONS;
  const channelOptions = STANDARD_CHANNEL_SECTIONS;

  // Derive pair list
  const pairs = deriveGirderPairs(memberProps);
  const [selectedPair, setSelectedPair] = useState<string>(() => pairs[0] || "G1 to G2");

  // Sync selectedPair when pairs change
  useEffect(() => {
    if (pairs.length > 0 && !pairs.includes(selectedPair)) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs, selectedPair]);

  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair);
  };

  const totalSpanM: number = (() => {
    const girders = Object.keys(memberProps?.girder_details || {});
    if (girders.length === 0) return 0;
    const segs: any[] = memberProps.girder_details[girders[0]]?.segments || [];
    return segs.reduce((s: number, seg: any) => s + Number(seg.length || 0), 0);
  })();

  const brace = memberProps.cross_bracing?.[selectedPair] || {};
  const spacingM = parseFloat(String(brace.spacing || "3")) || 3;
  const pairIdx = pairIndex(selectedPair);
  const memberCount = computeMemberCount(totalSpanM, spacingM);
  const memberIdDisplay = formatMemberId(pairIdx, memberCount);

  // Chord rules: K-Bracing forces bottom chord on
  const isKBracing = (brace.bracing_type || "K-Bracing") === "K-Bracing";
  const effectiveBottomEnabled = isKBracing ? true : !!brace.bottom_chord_enabled;

  // Section options based on type
  const sectionOptionsFor = (typeLabel: string) =>
    isChannelType(typeLabel) ? channelOptions : angleOptions;

  const handleBracingTypeChange = (val: string) => {
    updateBracingField(selectedPair, "bracing_type", val);
    if (val === "K-Bracing") {
      updateBracingField(selectedPair, "bottom_chord_enabled", true);
    }
  };

  const handleTopChordToggle = (checked: boolean) => {
    updateBracingField(selectedPair, "top_chord_enabled", checked);
  };

  const handleBottomChordToggle = (checked: boolean) => {
    if (!isKBracing) {
      updateBracingField(selectedPair, "bottom_chord_enabled", checked);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", gap: 14, height: "100%" }}>

      {/* ── Left Column: Inputs ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Selection Box */}
        <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 8, columnGap: 14, alignItems: "center" }}>
            <Label>Select Girders:</Label>
            <Select
              value={selectedPair}
              onChange={(e) => handlePairChange(e.target.value)}
              options={pairs}
            />
            <Label>Member ID:</Label>
            <Input value={memberIdDisplay} onChange={() => {}} readOnly />
          </div>
        </div>

        {/* Section Inputs Box */}
        <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 10 }}>Section Inputs:</div>

          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 8, columnGap: 14, alignItems: "center" }}>
            
            {/* Design dropdown */}
            <Label>Design:</Label>
            <Select
              value={designMode}
              onChange={(e) => setDesignMode(e.target.value as "Optimized" | "Custom")}
              options={["Optimized", "Custom"]}
            />

            {/* Type of Bracing */}
            <Label>Type of Bracing:</Label>
            <Select
              value={brace.bracing_type || "K-Bracing"}
              onChange={(e) => handleBracingTypeChange(e.target.value)}
              options={BRACING_TYPE_OPTIONS}
            />

            {/* Bracing Section Type */}
            <Label>Bracing Section Type:</Label>
            <Select
              value={brace.bracing_section_type || "Angle"}
              onChange={(e) => updateBracingField(selectedPair, "bracing_section_type", e.target.value)}
              options={SECTION_TYPE_OPTIONS}
              disabled={!isCustom}
            />

            {/* Bracing Section Designation */}
            <Label>Bracing Section Designation:</Label>
            <Select
              value={brace.bracing_section || "ISA 5050x6"}
              onChange={(e) => updateBracingField(selectedPair, "bracing_section", e.target.value)}
              options={sectionOptionsFor(brace.bracing_section_type || "Angle")}
              disabled={!isCustom}
            />

            {/* Top Chord */}
            <Label>Top Chord:</Label>
            <input
              type="checkbox"
              checked={!!brace.top_chord_enabled}
              onChange={(e) => handleTopChordToggle(e.target.checked)}
              style={{ width: 15, height: 15 }}
            />

            <Label>Top Chord Section Type:</Label>
            <Select
              value={brace.top_chord_type || "Angle"}
              onChange={(e) => updateBracingField(selectedPair, "top_chord_type", e.target.value)}
              options={SECTION_TYPE_OPTIONS}
              disabled={!isCustom || !brace.top_chord_enabled}
            />

            <Label>Top Chord Section Designation:</Label>
            <Select
              value={brace.top_chord_size || "ISA 5050x6"}
              onChange={(e) => updateBracingField(selectedPair, "top_chord_size", e.target.value)}
              options={sectionOptionsFor(brace.top_chord_type || "Angle")}
              disabled={!isCustom || !brace.top_chord_enabled}
            />

            {/* Bottom Chord */}
            <Label>Bottom Chord:</Label>
            <input
              type="checkbox"
              checked={effectiveBottomEnabled}
              onChange={(e) => handleBottomChordToggle(e.target.checked)}
              disabled={isKBracing}
              style={{ width: 15, height: 15 }}
            />

            <Label>Bottom Chord Section Type:</Label>
            <Select
              value={brace.bottom_chord_type || "Angle"}
              onChange={(e) => updateBracingField(selectedPair, "bottom_chord_type", e.target.value)}
              options={SECTION_TYPE_OPTIONS}
              disabled={!isCustom || !effectiveBottomEnabled}
            />

            <Label>Bottom Chord Section Designation:</Label>
            <Select
              value={brace.bottom_chord_size || "ISA 5050x6"}
              onChange={(e) => updateBracingField(selectedPair, "bottom_chord_size", e.target.value)}
              options={sectionOptionsFor(brace.bottom_chord_type || "Angle")}
              disabled={!isCustom || !effectiveBottomEnabled}
            />

            {/* Spacing */}
            <Label>Spacing (m):</Label>
            <Input
              value={String(brace.spacing || "3")}
              onChange={(e) => updateBracingField(selectedPair, "spacing", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Right Column: CAD + Previews ────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Bracing Layout Diagram */}
        <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 6 }}>
            {brace.bracing_type || "K-Bracing"}
          </div>
          <div style={{ height: 170, border: "1px solid #eee", borderRadius: 6, overflow: "hidden", background: "#fafafa" }}>
            <BracingLayoutSvg
              bracingType={brace.bracing_type || "K-Bracing"}
              topChord={!!brace.top_chord_enabled}
              bottomChord={effectiveBottomEnabled}
              memberLabel={memberIdDisplay}
              pairLabel={selectedPair}
            />
          </div>
        </div>

        {/* Section Previews — always visible */}
        <SectionPreviewBox
          title="Bracing"
          sectionType={brace.bracing_section_type || "Angle"}
          designation={brace.bracing_section || ""}
          visible={true}
        />

        <SectionPreviewBox
          title="Top Chord"
          sectionType={brace.top_chord_type || "Angle"}
          designation={brace.top_chord_enabled ? (brace.top_chord_size || "") : ""}
          visible={!!brace.top_chord_enabled}
        />

        <SectionPreviewBox
          title="Bottom Chord"
          sectionType={brace.bottom_chord_type || "Angle"}
          designation={effectiveBottomEnabled ? (brace.bottom_chord_size || "") : ""}
          visible={effectiveBottomEnabled}
        />
      </div>
    </div>
  );
}
