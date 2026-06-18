import React, { useState, useEffect, Fragment } from "react";
import { Label, Input, Select } from "../../SharedComponents";
import {
  STANDARD_ANGLE_SECTIONS,
  STANDARD_CHANNEL_SECTIONS,
  ROLLED_IS_SECTIONS,
  SAIL_APPROVED_THICKNESS_VALUES,
  ROLLED_PROPERTIES,
} from "../../../../constants/memberConstants";
import { useBridgeStore } from "../../../../../store/bridgeStore";

interface EndDiaphragmDetailsTabProps {
  memberProps: any;
  updateEndDiaphragmField: (field: string, value: any) => void;
  rolledIsSections: string[];
  rolledProperties?: Record<string, any>;
}

const GREEN = "#95b80f";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseSingleThicknessValue(valStr: any, fallback: number): number {
  if (valStr === undefined || valStr === null || valStr === "") return fallback;
  const str = String(valStr);
  const parts = str.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return fallback;
  const num = Number(parts[0]);
  return isNaN(num) ? fallback : num;
}

function isChannelType(typeLabel: string): boolean {
  return typeLabel === "Channel" || typeLabel === "Double Channel";
}

/** Derive girder pairs from memberProps in "G1 to G2" format. */
function deriveGirderPairs(memberProps: any): string[] {
  const keys = Object.keys(memberProps?.cross_bracing || {});
  if (keys.length > 0) return keys;
  const girders = Object.keys(memberProps?.girder_details || {}).sort();
  if (girders.length < 2) return ["G1 to G2"];
  return girders.slice(0, -1).map((g, i) => `${g} to ${girders[i + 1]}`);
}

/** Parse the pair label to get the pair index (1-based). */
function pairIndex(pairLabel: string): number {
  const match = pairLabel.match(/G(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
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
    const { leg1, leg2, thickness } = parseAngleDesignation(designation);
    
    if (isDouble) {
      const L = 36;
      const t = Math.max(3, Math.min(8, (thickness / leg1) * L));
      const x0 = 110;
      const y0 = 85;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
          <polygon
            points={`${x0},${y0} ${x0-L},${y0} ${x0-L},${y0-t} ${x0-t},${y0-t} ${x0-t},${y0-L} ${x0},${y0-L}`}
            {...fillStyle}
          />
          <polygon
            points={`${x0},${y0} ${x0+L},${y0} ${x0+L},${y0-t} ${x0+t},${y0-t} ${x0+t},${y0-L} ${x0},${y0-L}`}
            {...fillStyle}
          />
          
          <line x1={45} y1={y0} x2={45} y2={y0-L} {...dimStyle} />
          <polygon points={`45,${y0} 43,${y0-8} 47,${y0-8}`} fill="#90AF13" />
          <polygon points={`45,${y0-L} 43,${y0-L+8} 47,${y0-L+8}`} fill="#90AF13" />
          <text x={40} y={y0 - L/2 + 3} textAnchor="end" {...textStyle}>H = {leg2} mm</text>

          <line x1={x0-L} y1={97} x2={x0+L} y2={97} {...dimStyle} />
          <polygon points={`${x0-L},97 ${x0-L+8},95 ${x0-L+8},99`} fill="#90AF13" />
          <polygon points={`${x0+L},97 ${x0+L-8},95 ${x0+L-8},99`} fill="#90AF13" />
          <text x={x0} y={106} textAnchor="middle" {...textStyle}>W = {leg1 * 2} mm</text>

          <line x1={x0 - 12} y1={25} x2={x0 + t + 12} y2={25} {...dimStyle} />
          <polygon points={`${x0},25 ${x0-8},23 ${x0-8},27`} fill="#90AF13" />
          <polygon points={`${x0+t},25 ${x0+t+8},23 ${x0+t+8},27`} fill="#90AF13" />
          <text x={x0 + t/2} y={17} textAnchor="middle" {...textStyle}>t = {thickness} mm</text>
        </svg>
      );
    }

    const L = 45;
    const t = Math.max(3, Math.min(10, (thickness / leg1) * L));
    const x0 = 100;
    const y0 = 85;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
        <polygon
          points={`${x0},${y0} ${x0+L},${y0} ${x0+L},${y0-t} ${x0+t},${y0-t} ${x0+t},${y0-L} ${x0},${y0-L}`}
          {...fillStyle}
        />
        
        <line x1={75} y1={y0} x2={75} y2={y0-L} {...dimStyle} />
        <polygon points={`75,${y0} 73,${y0-8} 77,${y0-8}`} fill="#90AF13" />
        <polygon points={`75,${y0-L} 73,${y0-L+8} 77,${y0-L+8}`} fill="#90AF13" />
        <text x={70} y={y0 - L/2 + 3} textAnchor="end" {...textStyle}>H = {leg2} mm</text>

        <line x1={x0} y1={25} x2={x0+L} y2={25} {...dimStyle} />
        <polygon points={`${x0},25 ${x0+8},23 ${x0+8},27`} fill="#90AF13" />
        <polygon points={`${x0+L},25 ${x0+L-8},23 ${x0+L-8},27`} fill="#90AF13" />
        <text x={x0 + L/2} y={17} textAnchor="middle" {...textStyle}>W = {leg1} mm</text>

        <line x1={x0 - 12} y1={97} x2={x0 + t + 12} y2={97} {...dimStyle} />
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
    const x0 = 110;
    const y0 = 85;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
        <polygon
          points={`${x0},${y0} ${x0-B_pixels},${y0} ${x0-B_pixels},${y0-tf_pixels} ${x0-tw_pixels},${y0-tf_pixels} ${x0-tw_pixels},${y0-D_pixels+tf_pixels} ${x0-B_pixels},${y0-D_pixels+tf_pixels} ${x0-B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
          {...fillStyle}
        />
        <polygon
          points={`${x0},${y0} ${x0+B_pixels},${y0} ${x0+B_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
          {...fillStyle}
        />
        
        <line x1={50} y1={y0} x2={50} y2={y0-D_pixels} {...dimStyle} />
        <polygon points={`50,${y0} 48,${y0-8} 52,${y0-8}`} fill="#90AF13" />
        <polygon points={`50,${y0-D_pixels} 48,${y0-D_pixels+8} 52,${y0-D_pixels+8}`} fill="#90AF13" />
        <text x={45} y={y0 - D_pixels/2 + 3} textAnchor="end" {...textStyle}>D = {d} mm</text>

        <line x1={x0-B_pixels} y1={97} x2={x0} y2={97} {...dimStyle} />
        <polygon points={`${x0-B_pixels},97 ${x0-B_pixels+8},95 ${x0-B_pixels+8},99`} fill="#90AF13" />
        <polygon points={`${x0},97 ${x0-8},95 ${x0-8},99`} fill="#90AF13" />
        <text x={x0 - B_pixels/2} y={106} textAnchor="middle" {...textStyle}>B = {b} mm</text>

        <line x1={x0 - tw_pixels - 12} y1={25} x2={x0 + 12} y2={25} {...dimStyle} />
        <polygon points={`${x0-tw_pixels},25 ${x0-tw_pixels-8},23 ${x0-tw_pixels-8},27`} fill="#90AF13" />
        <polygon points={`${x0},25 ${x0+8},23 ${x0+8},27`} fill="#90AF13" />
        <text x={x0 - tw_pixels/2} y={17} textAnchor="middle" {...textStyle}>tw = {tw} mm</text>

        <line x1={150} y1={y0 - D_pixels - 12} x2={150} y2={y0 - D_pixels + tf_pixels + 12} {...dimStyle} />
        <polygon points={`150,${y0-D_pixels} 148,${y0-D_pixels-8} 152,${y0-D_pixels-8}`} fill="#90AF13" />
        <polygon points={`150,${y0-D_pixels+tf_pixels} 148,${y0-D_pixels+tf_pixels+8} 152,${y0-D_pixels+tf_pixels+8}`} fill="#90AF13" />
        <text x={156} y={y0 - D_pixels + tf_pixels/2 + 3} textAnchor="start" {...textStyle}>tf = {tf} mm</text>
      </svg>
    );
  }

  const x0 = 100;
  const y0 = 85;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
      <polygon
        points={`${x0},${y0} ${x0+B_pixels},${y0} ${x0+B_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-tf_pixels} ${x0+tw_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels+tf_pixels} ${x0+B_pixels},${y0-D_pixels} ${x0},${y0-D_pixels}`}
        {...fillStyle}
      />
      
      <line x1={75} y1={y0} x2={75} y2={y0-D_pixels} {...dimStyle} />
      <polygon points={`75,${y0} 73,${y0-8} 77,${y0-8}`} fill="#90AF13" />
      <polygon points={`75,${y0-D_pixels} 73,${y0-D_pixels+8} 77,${y0-D_pixels+8}`} fill="#90AF13" />
      <text x={70} y={y0 - D_pixels/2 + 3} textAnchor="end" {...textStyle}>D = {d} mm</text>

      <line x1={x0} y1={97} x2={x0+B_pixels} y2={97} {...dimStyle} />
      <polygon points={`${x0},97 ${x0+8},95 ${x0+8},99`} fill="#90AF13" />
      <polygon points={`${x0+B_pixels},97 ${x0+B_pixels-8},95 ${x0+B_pixels-8},99`} fill="#90AF13" />
      <text x={x0 + B_pixels/2} y={106} textAnchor="middle" {...textStyle}>B = {b} mm</text>

      <line x1={x0 - 12} y1={25} x2={x0 + tw_pixels + 12} y2={25} {...dimStyle} />
      <polygon points={`${x0},25 ${x0-8},23 ${x0-8},27`} fill="#90AF13" />
      <polygon points={`${x0+tw_pixels},25 ${x0+tw_pixels+8},23 ${x0+tw_pixels+8},27`} fill="#90AF13" />
      <text x={x0 + tw_pixels/2} y={17} textAnchor="middle" {...textStyle}>tw = {tw} mm</text>

      <line x1={140} y1={y0 - D_pixels - 12} x2={140} y2={y0 - D_pixels + tf_pixels + 12} {...dimStyle} />
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

// ─── Section Properties Welded calculations ────────────────────────────────────
function calculateWeldedProperties(depth: number, top_width: number, bottom_width: number, web_thickness: number, top_thickness: number, bottom_thickness: number) {
  const h_web = Math.max(depth - top_thickness - bottom_thickness, 1.0);
  const area_top = top_width * top_thickness;
  const area_bottom = bottom_width * bottom_thickness;
  const area_web = web_thickness * h_web;
  const area_total_mm2 = area_top + area_bottom + area_web;
  const area_cm2 = area_total_mm2 / 100.0;
  const mass_kg_per_m = (area_total_mm2 / 1000000.0) * 7850.0;

  let iz_web = (web_thickness * Math.pow(h_web, 3)) / 12.0;
  let iz_top = (top_width * Math.pow(top_thickness, 3)) / 12.0;
  let iz_bottom = (bottom_width * Math.pow(bottom_thickness, 3)) / 12.0;
  const distance_top = h_web / 2.0 + top_thickness / 2.0;
  const distance_bottom = h_web / 2.0 + bottom_thickness / 2.0;
  iz_top += area_top * Math.pow(distance_top, 2);
  iz_bottom += area_bottom * Math.pow(distance_bottom, 2);
  const iz_cm4 = (iz_web + iz_top + iz_bottom) / 10000.0;

  const iy_web = (h_web * Math.pow(web_thickness, 3)) / 12.0;
  const iy_top = (top_thickness * Math.pow(top_width, 3)) / 12.0;
  const iy_bottom = (bottom_thickness * Math.pow(bottom_width, 3)) / 12.0;
  const iy_cm4 = (iy_web + iy_top + iy_bottom) / 10000.0;

  const rz_cm = area_cm2 > 0 ? Math.sqrt(iz_cm4 / area_cm2) : 0;
  const ry_cm = area_cm2 > 0 ? Math.sqrt(iy_cm4 / area_cm2) : 0;

  const depth_cm = depth / 10.0;
  const width_cm = Math.max(top_width, bottom_width) / 10.0;
  const zz_cm3 = depth_cm > 0 ? iz_cm4 / (depth_cm / 2.0) : 0;
  const zy_cm3 = width_cm > 0 ? iy_cm4 / (width_cm / 2.0) : 0;

  const zpl_major = (area_top * distance_top + area_bottom * distance_bottom + (web_thickness * Math.pow(h_web, 2)) / 4.0) / 1000.0;
  const zpl_minor = ((top_thickness * Math.pow(top_width, 2)) / 4.0 + (bottom_thickness * Math.pow(bottom_width, 2)) / 4.0 + (h_web * Math.pow(web_thickness, 2)) / 4.0) / 1000.0;

  return {
    mass: mass_kg_per_m.toFixed(2),
    area: area_cm2.toFixed(2),
    iz: iz_cm4.toFixed(2),
    iy: iy_cm4.toFixed(2),
    rz: rz_cm.toFixed(2),
    ry: ry_cm.toFixed(2),
    zz: zz_cm3.toFixed(2),
    zy: zy_cm3.toFixed(2),
    zpz: zpl_major.toFixed(2),
    zpy: zpl_minor.toFixed(2)
  };
}

function getDefaultsFor(viewType: string) {
  if (viewType === "Cross Bracing") {
    return {
      design: "Optimized",
      bracing_type: "K-Bracing",
      bracing_section_type: "Angle",
      bracing_section: "ISA 5050x6",
      top_chord_enabled: false,
      top_chord_type: "Angle",
      top_chord_size: "ISA 5050x6",
      bottom_chord_enabled: true,
      bottom_chord_type: "Angle",
      bottom_chord_size: "ISA 5050x6"
    };
  } else if (viewType === "Rolled Beam") {
    return {
      design: "Optimized",
      is_section: "MB 500"
    };
  } else {
    return {
      design: "Optimized",
      symmetry: "Girder Symmetric",
      welded_values: ["Girder Symmetric", "", "All", "", "", "All", "", "", "All", ""],
      total_depth_bounds: { lower: 200, upper: 2000, increment: 25 },
      top_width_bounds: { lower: 100, upper: 1000, increment: 10 },
      bottom_width_bounds: { lower: 100, upper: 1000, increment: 10 }
    };
  }
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EndDiaphragmDetailsTab({
  memberProps,
  updateEndDiaphragmField,
  rolledIsSections,
  rolledProperties,
}: EndDiaphragmDetailsTabProps) {
  const designMode = useBridgeStore((state) => state.designMode);
  const setDesignMode = useBridgeStore((state) => state.setDesignMode);
  const isCustom = designMode === "Custom";

  const pairs = deriveGirderPairs(memberProps);
  const [selectedPair, setSelectedPair] = useState<string>(() => pairs[0] || "G1 to G2");

  // Sync selectedPair when pairs change
  useEffect(() => {
    if (pairs.length > 0 && !pairs.includes(selectedPair)) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs, selectedPair]);

  const pairIdx = pairIndex(selectedPair);
  const activeMemberId = `E${pairIdx}M1`;

  const d = memberProps.end_diaphragm || {};
  const activeType = d.type || "Cross Bracing"; // "Cross Bracing", "Rolled Beam", "Welded Beam"

  const isCross = activeType === "Cross Bracing";
  const isRolled = activeType === "Rolled Beam";
  const isWelded = activeType === "Welded Beam";

  const byView = d.end_diaphragm_by_view || {};
  const viewState = byView[activeType]?.[activeMemberId] || getDefaultsFor(activeType);

  // Welded values getters & updates helper
  const wVals = viewState.welded_values || ["Girder Symmetric", "", "All", "", "", "All", "", "", "All", ""];
  const symmetry = wVals[0] || "Girder Symmetric";
  const total_depth = wVals[1] || "";
  const web_thickness_mode = wVals[2] || "All";
  const web_thickness_value = wVals[3] || "";
  const top_flange_width = wVals[4] || "";
  const top_thickness_mode = wVals[5] || "All";
  const top_thickness_value = wVals[6] || "";
  const bottom_flange_width = wVals[7] || "";
  const bottom_thickness_mode = wVals[8] || "All";
  const bottom_thickness_value = wVals[9] || "";

  const updateField = (viewType: string, field: string, value: any) => {
    const m1Id = `E${pairIdx}M1`;
    const m2Id = `E${pairIdx}M2`;
    
    const updatedTypeState = { ...(byView[viewType] || {}) };
    
    [m1Id, m2Id].forEach(memberId => {
      const memberState = updatedTypeState[memberId] ? { ...updatedTypeState[memberId] } : getDefaultsFor(viewType);
      memberState[field] = value;
      updatedTypeState[memberId] = memberState;
    });

    updateEndDiaphragmField("end_diaphragm_by_view", {
      ...byView,
      [viewType]: updatedTypeState
    });

    updateEndDiaphragmField("type", viewType);
    updateEndDiaphragmField("select_girders", selectedPair);
    updateEndDiaphragmField("member_id", `E${pairIdx}M1`);
  };

  // Sync tab local design state and welded defaults/modes when needed
  useEffect(() => {
    let changed = false;
    const nextState = { ...viewState };

    // 1. Sync design mode
    if (nextState.design !== designMode) {
      nextState.design = designMode;
      changed = true;
    }

    // 2. Sync Welded Beam values if activeType is Welded Beam
    if (activeType === "Welded Beam") {
      const nextVals = [...(nextState.welded_values || ["Girder Symmetric", "", "All", "", "", "All", "", "", "All", ""])];
      let weldedChanged = false;

      if (isCustom) {
        // In custom mode, thickness modes must be forced to "Custom"
        if (nextVals[2] !== "Custom") {
          nextVals[2] = "Custom";
          weldedChanged = true;
        }
        if (nextVals[5] !== "Custom") {
          nextVals[5] = "Custom";
          weldedChanged = true;
        }
        if (nextVals[8] !== "Custom") {
          nextVals[8] = "Custom";
          weldedChanged = true;
        }

        // Default thickness values to "12" if empty
        if (!nextVals[3]) {
          nextVals[3] = "12";
          weldedChanged = true;
        }
        if (!nextVals[6]) {
          nextVals[6] = "12";
          weldedChanged = true;
        }
        if (!nextVals[9]) {
          nextVals[9] = "12";
          weldedChanged = true;
        }
      } else {
        // In optimized mode, thickness modes must be "All" if they are "Optimized" or invalid
        if (nextVals[2] === "Optimized" || !nextVals[2]) {
          nextVals[2] = "All";
          weldedChanged = true;
        }
        if (nextVals[5] === "Optimized" || !nextVals[5]) {
          nextVals[5] = "All";
          weldedChanged = true;
        }
        if (nextVals[8] === "Optimized" || !nextVals[8]) {
          nextVals[8] = "All";
          weldedChanged = true;
        }
      }

      // Propagate top flange properties to bottom flange if Girder Symmetric
      if (nextVals[0] === "Girder Symmetric") {
        if (nextVals[7] !== nextVals[4]) {
          nextVals[7] = nextVals[4];
          weldedChanged = true;
        }
        if (nextVals[8] !== nextVals[5]) {
          nextVals[8] = nextVals[5];
          weldedChanged = true;
        }
        if (nextVals[9] !== nextVals[6]) {
          nextVals[9] = nextVals[6];
          weldedChanged = true;
        }
      }

      if (weldedChanged) {
        nextState.welded_values = nextVals;
        changed = true;
      }
    }

    if (changed) {
      const m1Id = `E${pairIdx}M1`;
      const m2Id = `E${pairIdx}M2`;
      const updatedTypeState = { ...(byView[activeType] || {}) };
      
      [m1Id, m2Id].forEach(memberId => {
        updatedTypeState[memberId] = {
          ...(updatedTypeState[memberId] || getDefaultsFor(activeType)),
          ...nextState
        };
      });

      updateEndDiaphragmField("end_diaphragm_by_view", {
        ...byView,
        [activeType]: updatedTypeState
      });
      updateEndDiaphragmField("type", activeType);
      updateEndDiaphragmField("select_girders", selectedPair);
      updateEndDiaphragmField("member_id", `E${pairIdx}M1`);
    }
  }, [designMode, activeType, selectedPair, viewState]);

  const handleTypeChange = (newType: string) => {
    const currentByView = { ...byView };
    if (!currentByView[newType]) {
      currentByView[newType] = {};
    }
    const m1Id = `E${pairIdx}M1`;
    const m2Id = `E${pairIdx}M2`;
    if (!currentByView[newType][m1Id]) {
      currentByView[newType][m1Id] = getDefaultsFor(newType);
    }
    if (!currentByView[newType][m2Id]) {
      currentByView[newType][m2Id] = getDefaultsFor(newType);
    }
    updateEndDiaphragmField("end_diaphragm_by_view", currentByView);
    updateEndDiaphragmField("type", newType);
  };

  const updateWeldedValue = (index: number, val: string) => {
    const nextVals = [...wVals];
    nextVals[index] = val;
    
    // Symmetric propagation
    if (nextVals[0] === "Girder Symmetric") {
      if (index === 4) {
        nextVals[7] = val; // bottom width = top width
      } else if (index === 5) {
        nextVals[8] = val; // bottom mode = top mode
      } else if (index === 6) {
        nextVals[9] = val; // bottom thickness = top thickness
      }
    }
    
    updateField("Welded Beam", "welded_values", nextVals);
  };

  const handleSymmetryChange = (newSymmetry: string) => {
    const nextVals = [...wVals];
    nextVals[0] = newSymmetry;
    if (newSymmetry === "Girder Symmetric") {
      nextVals[7] = nextVals[4]; 
      nextVals[8] = nextVals[5]; 
      nextVals[9] = nextVals[6]; 
    }
    updateField("Welded Beam", "welded_values", nextVals);
  };

  // Bounds Modal state
  const [boundsModalOpen, setBoundsModalOpen] = useState<boolean>(false);
  const [boundsField, setBoundsField] = useState<"total_depth" | "top_width" | "bottom_width" | null>(null);
  const [tempLower, setTempLower] = useState<string>("");
  const [tempUpper, setTempUpper] = useState<string>("");
  const [tempIncrement, setTempIncrement] = useState<string>("");

  // Thickness Multi-Select Modal state
  const [thicknessModalOpen, setThicknessModalOpen] = useState<boolean>(false);
  const [activeThicknessField, setActiveThicknessField] = useState<number | null>(null); // 3: web, 6: top, 9: bottom
  const [tempSelectedThicknesses, setTempSelectedThicknesses] = useState<string[]>([]);
  const [highlightedAvailable, setHighlightedAvailable] = useState<string[]>([]);
  const [highlightedSelected, setHighlightedSelected] = useState<string[]>([]);

  const handleOpenThicknessDialog = (fieldIndex: number, currentVal: any) => {
    setActiveThicknessField(fieldIndex);
    const currentValStr = String(currentVal || "");
    const parsed = currentValStr ? currentValStr.split(",").map(v => v.trim()).filter(v => SAIL_APPROVED_THICKNESS_VALUES.includes(v)) : [];
    const initialSelected = parsed.length > 0 ? parsed : [...SAIL_APPROVED_THICKNESS_VALUES];
    setTempSelectedThicknesses(initialSelected);
    setHighlightedAvailable([]);
    setHighlightedSelected([]);
    setThicknessModalOpen(true);
  };

  const handleSaveThicknesses = () => {
    if (activeThicknessField === null) return;
    const sorted = [...tempSelectedThicknesses].sort((a, b) => {
      const idxA = SAIL_APPROVED_THICKNESS_VALUES.indexOf(a);
      const idxB = SAIL_APPROVED_THICKNESS_VALUES.indexOf(b);
      return idxA - idxB;
    });
    const joined = sorted.join(", ");
    updateWeldedValue(activeThicknessField, joined);
    setThicknessModalOpen(false);
  };

  const moveAllRight = () => {
    setTempSelectedThicknesses([...SAIL_APPROVED_THICKNESS_VALUES]);
    setHighlightedAvailable([]);
    setHighlightedSelected([]);
  };

  const moveSelectedRight = () => {
    const nextSelected = [...tempSelectedThicknesses, ...highlightedAvailable];
    const uniqueSelected = Array.from(new Set(nextSelected));
    setTempSelectedThicknesses(uniqueSelected);
    setHighlightedAvailable([]);
  };

  const moveSelectedLeft = () => {
    const nextSelected = tempSelectedThicknesses.filter(v => !highlightedSelected.includes(v));
    setTempSelectedThicknesses(nextSelected);
    setHighlightedSelected([]);
  };

  const moveAllLeft = () => {
    setTempSelectedThicknesses([]);
    setHighlightedAvailable([]);
    setHighlightedSelected([]);
  };

  const getSortedAvailable = () => {
    return SAIL_APPROVED_THICKNESS_VALUES.filter(v => !tempSelectedThicknesses.includes(v));
  };

  const getSortedSelected = () => {
    return [...tempSelectedThicknesses].sort((a, b) => {
      return SAIL_APPROVED_THICKNESS_VALUES.indexOf(a) - SAIL_APPROVED_THICKNESS_VALUES.indexOf(b);
    });
  };

  const handleOpenBoundsDialog = (field: "total_depth" | "top_width" | "bottom_width") => {
    const boundsKey = `${field}_bounds`;
    const defaults: Record<string, { lower: number; upper: number; increment: number }> = {
      total_depth: { lower: 200, upper: 2000, increment: 25 },
      top_width: { lower: 100, upper: 1000, increment: 10 },
      bottom_width: { lower: 100, upper: 1000, increment: 10 }
    };
    const currentBounds = viewState[boundsKey] || defaults[field];
    setBoundsField(field);
    setTempLower(String(currentBounds.lower));
    setTempUpper(String(currentBounds.upper));
    setTempIncrement(String(currentBounds.increment));
    setBoundsModalOpen(true);
  };

  const handleSaveBounds = () => {
    if (!boundsField) return;
    const lower = Number(tempLower);
    const upper = Number(tempUpper);
    const increment = Number(tempIncrement);

    if (isNaN(lower) || isNaN(upper) || isNaN(increment)) {
      alert("Please enter valid numbers");
      return;
    }
    if (upper <= lower) {
      alert("Upper bound must be greater than lower bound");
      return;
    }
    if (increment <= 0) {
      alert("Increment must be greater than 0");
      return;
    }

    const boundsKey = `${boundsField}_bounds`;
    const m1Id = `E${pairIdx}M1`;
    const m2Id = `E${pairIdx}M2`;
    
    const updatedTypeState = { ...(byView[activeType] || {}) };
    
    [m1Id, m2Id].forEach(memberId => {
      const memberState = updatedTypeState[memberId] ? { ...updatedTypeState[memberId] } : getDefaultsFor(activeType);
      memberState[boundsKey] = { lower, upper, increment };
      
      // Symmetric bounds propagation
      if (symmetry === "Girder Symmetric") {
        if (boundsField === "top_width") {
          memberState.bottom_width_bounds = { lower, upper, increment };
        } else if (boundsField === "bottom_width") {
          memberState.top_width_bounds = { lower, upper, increment };
        }
      }
      updatedTypeState[memberId] = memberState;
    });

    updateEndDiaphragmField("end_diaphragm_by_view", {
      ...byView,
      [activeType]: updatedTypeState
    });

    setBoundsModalOpen(false);
  };

  // Chord rules
  const isKBrace = (viewState.bracing_type || "K-Bracing") === "K-Bracing";
  const effectiveBottomEnabled = isKBrace ? true : (viewState.bottom_chord_enabled ?? true);

  const handleBracingTypeChange = (val: string) => {
    updateField("Cross Bracing", "bracing_type", val);
    if (val === "K-Bracing") {
      updateField("Cross Bracing", "bottom_chord_enabled", true);
    }
  };

  // Render Section Properties (Rolled / Welded)
  const renderSectionPropertiesBox = () => {
    let props: any = null;
    if (isWelded) {
      if (!total_depth || !top_flange_width || (symmetry === "Girder Unsymmetric" && !bottom_flange_width)) {
        props = {
          mass: "",
          area: "",
          iz: "",
          iy: "",
          rz: "",
          ry: "",
          zz: "",
          zy: "",
          zpz: "",
          zpy: ""
        };
      } else {
        const depth_val = Number(total_depth) || 800;
        const tfw_val = Number(top_flange_width) || 250;
        const bfw_val = symmetry === "Girder Symmetric" ? tfw_val : (Number(bottom_flange_width) || tfw_val);
        
        const web_default = Math.max(8.0, depth_val * 0.02);
        const flange_default = Math.max(10.0, depth_val * 0.03);

        const wt_val = web_thickness_mode === "Custom" ? parseSingleThicknessValue(web_thickness_value, web_default) : web_default;
        const tft_val = top_thickness_mode === "Custom" ? parseSingleThicknessValue(top_thickness_value, flange_default) : flange_default;
        const bft_val = symmetry === "Girder Symmetric" ? tft_val : (bottom_thickness_mode === "Custom" ? parseSingleThicknessValue(bottom_thickness_value, flange_default) : flange_default);

        props = calculateWeldedProperties(depth_val, tfw_val, bfw_val, wt_val, tft_val, bft_val);
      }
    } else {
      const sectionName = viewState.is_section || "MB 500";
      const activeRolledProperties = Object.keys(rolledProperties || {}).length > 0 ? rolledProperties : ROLLED_PROPERTIES;
      const p = activeRolledProperties?.[sectionName];
      if (p) {
        props = {
          mass: Number(p.mass).toFixed(2),
          area: Number(p.area).toFixed(2),
          iz: Number(p.iz).toFixed(2),
          iy: Number(p.iy).toFixed(2),
          rz: Number(p.rz).toFixed(2),
          ry: Number(p.ry).toFixed(2),
          zz: Number(p.zz).toFixed(2),
          zy: Number(p.zy).toFixed(2),
          zpz: Number(p.zpz).toFixed(2),
          zpy: Number(p.zpy).toFixed(2)
        };
      }
    }

    if (!props) return null;

    const items = [
      { label: <span>Mass, M (Kg/m)</span>, value: props.mass },
      { label: <span>Sectional Area, a (cm<sup>2</sup>)</span>, value: props.area },
      { label: <span>2nd Moment of Area, I<sub>z</sub> (cm<sup>4</sup>)</span>, value: props.iz },
      { label: <span>2nd Moment of Area, I<sub>y</sub> (cm<sup>4</sup>)</span>, value: props.iy },
      { label: <span>Radius of Gyration, r<sub>z</sub> (cm)</span>, value: props.rz },
      { label: <span>Radius of Gyration, r<sub>y</sub> (cm)</span>, value: props.ry },
      { label: <span>Elastic Modulus, Z<sub>z</sub> (cm<sup>3</sup>)</span>, value: props.zz },
      { label: <span>Elastic Modulus, Z<sub>y</sub> (cm<sup>3</sup>)</span>, value: props.zy },
      { label: <span>Plastic Modulus, Z<sub>uz</sub> (cm<sup>3</sup>)</span>, value: props.zpz },
      { label: <span>Plastic Modulus, Z<sub>uy</sub> (cm<sup>3</sup>)</span>, value: props.zpy }
    ];

    return (
      <div style={{ background: "#ffffff", border: "1px solid #cfcfcf", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 12 }}>
          Section Properties:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", rowGap: 10, columnGap: 16, alignItems: "center" }}>
          {items.map((item, idx) => (
            <Fragment key={idx}>
              <div style={{ fontSize: 10, color: "#5a5a5a" }}>{item.label}</div>
              <Input value={item.value} disabled={false} readOnly />
            </Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render I-Beam SVG preview (Rolled / Welded)
  const renderIBeamDiagram = () => {
    const isWelded = activeType === "Welded Beam";
    
    if (isWelded && (!total_depth || !top_flange_width || (symmetry === "Girder Unsymmetric" && !bottom_flange_width))) {
      return (
        <div style={{
          height: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 12,
          textAlign: "center",
          fontFamily: '"Ubuntu Sans", sans-serif'
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Welded section preview</div>
          <div>Enter depth and flange widths</div>
        </div>
      );
    }

    const rolledProp = !isWelded ? (rolledProperties?.[viewState.is_section || "MB 500"] || ROLLED_PROPERTIES[viewState.is_section || "MB 500"]) : null;

    const tfw_val = isWelded ? Number(top_flange_width) : rolledProp?.tfw || 180;
    const bfw_val = isWelded ? (symmetry === "Girder Symmetric" ? tfw_val : (Number(bottom_flange_width) || tfw_val)) : rolledProp?.bfw || 180;
    const depth_val = isWelded ? Number(total_depth) : rolledProp?.depth || 500;
    
    const web_default = Math.max(8.0, depth_val * 0.02);
    const flange_default = Math.max(10.0, depth_val * 0.03);

    const wt_val = isWelded 
      ? (web_thickness_mode === "Custom" ? parseSingleThicknessValue(web_thickness_value, web_default) : web_default) 
      : rolledProp?.wt || 10.2;
    const tft_val = isWelded 
      ? (top_thickness_mode === "Custom" ? parseSingleThicknessValue(top_thickness_value, flange_default) : flange_default) 
      : rolledProp?.tft || 17.2;
    const bft_val = isWelded 
      ? (symmetry === "Girder Symmetric" ? tft_val : (bottom_thickness_mode === "Custom" ? parseSingleThicknessValue(bottom_thickness_value, flange_default) : flange_default)) 
      : rolledProp?.bft || 17.2;

    const CenterX = 180;
    const CenterY = 110;
    const maxWidth = 180;
    const maxHeight = 120;
    const maxInputWidth = Math.max(tfw_val, bfw_val, 1);
    const maxInputHeight = Math.max(depth_val, 1);
    const scale = Math.min(maxWidth / maxInputWidth, maxHeight / maxInputHeight);

    const topW = Math.max(10, tfw_val * scale);
    const botW = Math.max(10, bfw_val * scale);
    const depth = Math.max(20, depth_val * scale);
    const topT = Math.max(2, tft_val * scale);
    const botT = Math.max(2, bft_val * scale);
    const webW = Math.max(2, wt_val * scale);

    const yTop = CenterY - depth / 2;
    const yTopInner = yTop + topT;
    const yBot = CenterY + depth / 2;
    const yBotInner = yBot - botT;
    const maxW = Math.max(topW, botW);

    const W = 360, H = 220;
    const dimStyle = { stroke: "#90AF13", strokeWidth: 1 };
    const textStyle = { fontSize: 10, fill: "#0f0f0f", fontFamily: '"Ubuntu Sans", sans-serif' };

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="220" style={{ background: "#ffffff", display: "block", margin: "0 auto" }}>
        {/* Ticks & Dimension Lines */}
        {/* tfw (Top flange width) */}
        <line x1={CenterX - topW / 2} y1={yTop - 12} x2={CenterX + topW / 2} y2={yTop - 12} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - topW / 2} y1={yTop} x2={CenterX - topW / 2} y2={yTop - 16} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX + topW / 2} y1={yTop} x2={CenterX + topW / 2} y2={yTop - 16} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX - topW / 2},${yTop - 12} ${CenterX - topW / 2 + 5},${yTop - 15} ${CenterX - topW / 2 + 5},${yTop - 9}`} fill="#90AF13" />
        <polygon points={`${CenterX + topW / 2},${yTop - 12} ${CenterX + topW / 2 - 5},${yTop - 15} ${CenterX + topW / 2 - 5},${yTop - 9}`} fill="#90AF13" />
        <text x={CenterX} y={yTop - 20} fill="#90AF13" fontSize="11" textAnchor="middle" fontWeight="bold">
          t<tspan dy="3" fontSize="8">fw</tspan><tspan dy="-3"> = {tfw_val} mm</tspan>
        </text>

        {/* bfw (Bottom flange width) */}
        <line x1={CenterX - botW / 2} y1={yBot + 12} x2={CenterX + botW / 2} y2={yBot + 12} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - botW / 2} y1={yBot} x2={CenterX - botW / 2} y2={yBot + 16} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX + botW / 2} y1={yBot} x2={CenterX + botW / 2} y2={yBot + 16} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX - botW / 2},${yBot + 12} ${CenterX - botW / 2 + 5},${yBot + 9} ${CenterX - botW / 2 + 5},${yBot + 15}`} fill="#90AF13" />
        <polygon points={`${CenterX + botW / 2},${yBot + 12} ${CenterX + botW / 2 - 5},${yBot + 9} ${CenterX + botW / 2 - 5},${yBot + 15}`} fill="#90AF13" />
        <text x={CenterX} y={yBot + 28} fill="#90AF13" fontSize="11" textAnchor="middle" fontWeight="bold">
          b<tspan dy="3" fontSize="8">fw</tspan><tspan dy="-3"> = {bfw_val} mm</tspan>
        </text>

        {/* d (Total depth) */}
        <line x1={CenterX + Math.max(topW, botW) / 2 + 15} y1={yTop} x2={CenterX + Math.max(topW, botW) / 2 + 15} y2={yBot} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX + topW / 2} y1={yTop} x2={CenterX + Math.max(topW, botW) / 2 + 19} y2={yTop} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX + botW / 2} y1={yBot} x2={CenterX + Math.max(topW, botW) / 2 + 19} y2={yBot} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX + Math.max(topW, botW) / 2 + 15},${yTop} ${CenterX + Math.max(topW, botW) / 2 + 12},${yTop + 5} ${CenterX + Math.max(topW, botW) / 2 + 18},${yTop + 5}`} fill="#90AF13" />
        <polygon points={`${CenterX + Math.max(topW, botW) / 2 + 15},${yBot} ${CenterX + Math.max(topW, botW) / 2 + 12},${yBot - 5} ${CenterX + Math.max(topW, botW) / 2 + 18},${yBot - 5}`} fill="#90AF13" />
        <text x={CenterX + Math.max(topW, botW) / 2 + 23} y={CenterY + 4} fill="#90AF13" fontSize="11" textAnchor="start" fontWeight="bold">
          d = {depth_val} mm
        </text>

        {/* tft (Top flange thickness) */}
        <line x1={CenterX - maxW / 2 - 12} y1={yTop} x2={CenterX - maxW / 2 - 12} y2={yTopInner} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - topW / 2} y1={yTop} x2={CenterX - maxW / 2 - 16} y2={yTop} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - topW / 2} y1={yTopInner} x2={CenterX - maxW / 2 - 16} y2={yTopInner} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX - maxW / 2 - 12},${yTop} ${CenterX - maxW / 2 - 15},${yTop + 4} ${CenterX - maxW / 2 - 9},${yTop + 4}`} fill="#90AF13" />
        <polygon points={`${CenterX - maxW / 2 - 12},${yTopInner} ${CenterX - maxW / 2 - 15},${yTopInner - 4} ${CenterX - maxW / 2 - 9},${yTopInner - 4}`} fill="#90AF13" />
        <text x={CenterX - maxW / 2 - 20} y={yTop + topT / 2 + 4} fill="#90AF13" fontSize="11" textAnchor="end" fontWeight="bold">
          t<tspan dy="3" fontSize="8">ft</tspan><tspan dy="-3"> = {tft_val} mm</tspan>
        </text>

        {/* bft (Bottom flange thickness) */}
        <line x1={CenterX - maxW / 2 - 12} y1={yBotInner} x2={CenterX - maxW / 2 - 12} y2={yBot} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - botW / 2} y1={yBotInner} x2={CenterX - maxW / 2 - 16} y2={yBotInner} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - botW / 2} y1={yBot} x2={CenterX - maxW / 2 - 16} y2={yBot} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX - maxW / 2 - 12},${yBotInner} ${CenterX - maxW / 2 - 15},${yBotInner + 4} ${CenterX - maxW / 2 - 9},${yBotInner + 4}`} fill="#90AF13" />
        <polygon points={`${CenterX - maxW / 2 - 12},${yBot} ${CenterX - maxW / 2 - 15},${yBot - 4} ${CenterX - maxW / 2 - 9},${yBot - 4}`} fill="#90AF13" />
        <text x={CenterX - maxW / 2 - 20} y={yBot - botT / 2 + 4} fill="#90AF13" fontSize="11" textAnchor="end" fontWeight="bold">
          b<tspan dy="3" fontSize="8">ft</tspan><tspan dy="-3"> = {bft_val} mm</tspan>
        </text>

        {/* wt (Web thickness) */}
        <line x1={CenterX - webW / 2 - 8} y1={CenterY} x2={CenterX + webW / 2 + 8} y2={CenterY} stroke="#90AF13" strokeWidth="1" />
        <polygon points={`${CenterX - webW / 2},${CenterY} ${CenterX - webW / 2 - 5},${CenterY - 3} ${CenterX - webW / 2 - 5},${CenterY + 3}`} fill="#90AF13" />
        <polygon points={`${CenterX + webW / 2},${CenterY} ${CenterX + webW / 2 + 5},${CenterY - 3} ${CenterX + webW / 2 + 5},${CenterY + 3}`} fill="#90AF13" />
        <text x={CenterX - webW / 2 - 12} y={CenterY + 4} fill="#90AF13" fontSize="11" textAnchor="end" fontWeight="bold">
          w<tspan dy="3" fontSize="8">t</tspan><tspan dy="-3"> = {wt_val} mm</tspan>
        </text>

        {/* Shape rects */}
        <rect x={CenterX - topW / 2} y={yTop} width={topW} height={topT} fill="#fefefe" stroke="#1b1b1b" strokeWidth="1.5" />
        <rect x={CenterX - webW / 2} y={yTopInner} width={webW} height={yBotInner - yTopInner} fill="#fefefe" stroke="#1b1b1b" strokeWidth="1.5" />
        <rect x={CenterX - botW / 2} y={yBotInner} width={botW} height={botT} fill="#fefefe" stroke="#1b1b1b" strokeWidth="1.5" />

        <text x={180} y={212} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f0f0f" fontFamily='"Ubuntu Sans", sans-serif'>
          {isWelded ? "Welded section" : `Rolled section • ${viewState.is_section || "MB 500"}`}
        </text>
      </svg>
    );
  };

  const handleTopChordToggle = (checked: boolean) => {
    updateField("Cross Bracing", "top_chord_enabled", checked);
  };

  const handleBottomChordToggle = (checked: boolean) => {
    if (!isKBrace) {
      updateField("Cross Bracing", "bottom_chord_enabled", checked);
    }
  };

  return (
    <div style={{ display: "flex", gap: 14, height: "100%", width: "100%" }}>
      {/* ── Left Column: Inputs ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Selection Box */}
        <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 8, columnGap: 14, alignItems: "center" }}>
            <Label>Select Girders:</Label>
            <Select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              options={pairs}
            />
            <Label>Member ID:</Label>
            <Input value={`${activeMemberId} / E${pairIdx}M2`} onChange={() => {}} readOnly disabled />
          </div>
        </div>

        {/* Section Inputs Box */}
        <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 10 }}>Section Inputs:</div>

          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 8, columnGap: 14, alignItems: "center" }}>
            <Label>Type:</Label>
            <Select
              value={activeType}
              onChange={e => handleTypeChange(e.target.value)}
              options={isCustom ? ["Cross Bracing", "Rolled Beam", "Welded Beam"] : ["Cross Bracing", "Welded Beam"]}
            />

            {/* Cross Bracing inputs */}
            {isCross && (
              <>
                <Label>Type of Bracing:</Label>
                <Select
                  value={viewState.bracing_type || "K-Bracing"}
                  onChange={(e) => handleBracingTypeChange(e.target.value)}
                  options={["K-Bracing", "X-Bracing"]}
                  disabled={!isCustom}
                />

                <Label>Bracing Section Type:</Label>
                <Select
                  value={viewState.bracing_section_type || "Angle"}
                  onChange={(e) => updateField("Cross Bracing", "bracing_section_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom}
                />

                <Label>Bracing Section Designation:</Label>
                <Select
                  value={viewState.bracing_section || "ISA 5050x6"}
                  onChange={(e) => updateField("Cross Bracing", "bracing_section", e.target.value)}
                  options={isChannelType(viewState.bracing_section_type || "Angle") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "4px 0" }} />

                <Label>Top Chord:</Label>
                <input
                  type="checkbox"
                  checked={!!viewState.top_chord_enabled}
                  onChange={(e) => handleTopChordToggle(e.target.checked)}
                  disabled={!isCustom}
                  style={{ width: 15, height: 15 }}
                />

                <Label>Top Chord Section Type:</Label>
                <Select
                  value={viewState.top_chord_type || "Angle"}
                  onChange={(e) => updateField("Cross Bracing", "top_chord_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom || !viewState.top_chord_enabled}
                />

                <Label>Top Chord Section Designation:</Label>
                <Select
                  value={viewState.top_chord_size || "ISA 5050x6"}
                  onChange={(e) => updateField("Cross Bracing", "top_chord_size", e.target.value)}
                  options={isChannelType(viewState.top_chord_type || "Angle") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom || !viewState.top_chord_enabled}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "4px 0" }} />

                <Label>Bottom Chord:</Label>
                <input
                  type="checkbox"
                  checked={effectiveBottomEnabled}
                  onChange={(e) => handleBottomChordToggle(e.target.checked)}
                  disabled={!isCustom || isKBrace}
                  style={{ width: 15, height: 15 }}
                />

                <Label>Bottom Chord Section Type:</Label>
                <Select
                  value={viewState.bottom_chord_type || "Angle"}
                  onChange={(e) => updateField("Cross Bracing", "bottom_chord_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom || !effectiveBottomEnabled}
                />

                <Label>Bottom Chord Section Designation:</Label>
                <Select
                  value={viewState.bottom_chord_size || "ISA 5050x6"}
                  onChange={(e) => updateField("Cross Bracing", "bottom_chord_size", e.target.value)}
                  options={isChannelType(viewState.bottom_chord_type || "Angle") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom || !effectiveBottomEnabled}
                />
              </>
            )}

            {/* Rolled Beam inputs */}
            {isRolled && (
              <>
                <Label>IS Section:</Label>
                <Select
                  value={viewState.is_section || "MB 500"}
                  onChange={(e) => updateField("Rolled Beam", "is_section", e.target.value)}
                  options={rolledIsSections && rolledIsSections.length > 0 ? rolledIsSections : ROLLED_IS_SECTIONS}
                  disabled={!isCustom}
                />
              </>
            )}

            {/* Welded Beam inputs */}
            {isWelded && (
              <>
                <Label>Symmetry:</Label>
                <Select
                  value={symmetry}
                  onChange={e => handleSymmetryChange(e.target.value)}
                  options={["Girder Symmetric", "Girder Unsymmetric"]}
                  disabled={!isCustom}
                />

                <Label>Total Depth, d (mm):</Label>
                {!isCustom ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenBoundsDialog("total_depth")}
                      style={{
                        padding: "4px 10px",
                        background: "#90AF13",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Set Bounds
                    </button>
                  </div>
                ) : (
                  <Input
                    value={total_depth}
                    onChange={e => updateWeldedValue(1, e.target.value)}
                  />
                )}

                <Label>Web Thickness, w<sub>t</sub> (mm):</Label>
                {!isCustom ? (
                  <Select
                    value={web_thickness_mode}
                    onChange={e => {
                      const val = e.target.value;
                      updateWeldedValue(2, val);
                      if (val === "Custom") {
                        handleOpenThicknessDialog(3, web_thickness_value);
                      }
                    }}
                    options={["All", "Custom"]}
                  />
                ) : (
                  <Select
                    value={web_thickness_value || "12"}
                    onChange={e => updateWeldedValue(3, e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                  />
                )}

                <Label>Width of Top Flange, t<sub>fw</sub> (mm):</Label>
                {!isCustom ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenBoundsDialog("top_width")}
                      style={{
                        padding: "4px 10px",
                        background: "#90AF13",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Set Bounds
                    </button>
                  </div>
                ) : (
                  <Input
                    value={top_flange_width}
                    onChange={e => updateWeldedValue(4, e.target.value)}
                  />
                )}

                <Label>Top Flange Thickness, t<sub>ft</sub> (mm):</Label>
                {!isCustom ? (
                  <Select
                    value={top_thickness_mode}
                    onChange={e => {
                      const val = e.target.value;
                      updateWeldedValue(5, val);
                      if (val === "Custom") {
                        handleOpenThicknessDialog(6, top_thickness_value);
                      }
                    }}
                    options={["All", "Custom"]}
                  />
                ) : (
                  <Select
                    value={top_thickness_value || "12"}
                    onChange={e => updateWeldedValue(6, e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                  />
                )}

                <Label>Width of Bottom Flange, b<sub>fw</sub> (mm):</Label>
                {!isCustom ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenBoundsDialog("bottom_width")}
                      style={{
                        padding: "4px 10px",
                        background: "#90AF13",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                      disabled={symmetry === "Girder Symmetric"}
                    >
                      Set Bounds
                    </button>
                  </div>
                ) : (
                  <Input
                    value={symmetry === "Girder Symmetric" ? top_flange_width : bottom_flange_width}
                    onChange={e => updateWeldedValue(7, e.target.value)}
                    disabled={symmetry === "Girder Symmetric"}
                  />
                )}

                <Label>Bottom Flange Thickness, b<sub>ft</sub> (mm):</Label>
                {!isCustom ? (
                  <Select
                    value={symmetry === "Girder Symmetric" ? top_thickness_mode : bottom_thickness_mode}
                    onChange={e => {
                      const val = e.target.value;
                      updateWeldedValue(8, val);
                      if (val === "Custom") {
                        handleOpenThicknessDialog(9, bottom_thickness_value);
                      }
                    }}
                    options={["All", "Custom"]}
                  />
                ) : (
                  <Select
                    value={(symmetry === "Girder Symmetric" ? top_thickness_value : bottom_thickness_value) || "12"}
                    onChange={e => updateWeldedValue(9, e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Column: Previews & Properties ───────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {!(isWelded && !isCustom) && (
          isCross ? (
            <>
              {/* Bracing Layout Diagram */}
              <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 6 }}>
                  {viewState.bracing_type || "K-Bracing"}
                </div>
                <div style={{ height: 170, border: "1px solid #eee", borderRadius: 6, overflow: "hidden", background: "#fafafa" }}>
                  <BracingLayoutSvg
                    bracingType={viewState.bracing_type || "K-Bracing"}
                    topChord={!!viewState.top_chord_enabled}
                    bottomChord={effectiveBottomEnabled}
                    memberLabel={`${activeMemberId} / E${pairIdx}M2`}
                    pairLabel={selectedPair}
                  />
                </div>
              </div>

              {/* Section Previews */}
              <SectionPreviewBox
                title="Bracing"
                sectionType={viewState.bracing_section_type || "Angle"}
                designation={viewState.bracing_section || ""}
                visible={true}
              />

              <SectionPreviewBox
                title="Top Chord"
                sectionType={viewState.top_chord_type || "Angle"}
                designation={viewState.top_chord_enabled ? (viewState.top_chord_size || "") : ""}
                visible={!!viewState.top_chord_enabled}
              />

              <SectionPreviewBox
                title="Bottom Chord"
                sectionType={viewState.bottom_chord_type || "Angle"}
                designation={effectiveBottomEnabled ? (viewState.bottom_chord_size || "") : ""}
                visible={effectiveBottomEnabled}
              />
            </>
          ) : (
            <>
              {/* I-Beam diagram */}
              <div style={{ background: "#fff", border: "1px solid #cfcfcf", borderRadius: 8, padding: 10 }}>
                <div style={{ border: "1px solid #eee", borderRadius: 6, background: "#fafafa" }}>
                  {renderIBeamDiagram()}
                </div>
              </div>

              {/* Section Properties */}
              {renderSectionPropertiesBox()}
            </>
          )
        )}
      </div>

      {/* Bounds Modal Backdrop */}
      {boundsModalOpen && boundsField && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}>
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: 300,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: "bold", color: "#333" }}>
              Set Bounds: {boundsField === "total_depth" ? "Total Depth" : boundsField === "top_width" ? "Top Flange Width" : "Bottom Flange Width"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, marginBottom: 4, color: "#555" }}>Lower Bound (mm)</label>
                <input
                  type="number"
                  value={tempLower}
                  onChange={e => setTempLower(e.target.value)}
                  style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, marginBottom: 4, color: "#555" }}>Upper Bound (mm)</label>
                <input
                  type="number"
                  value={tempUpper}
                  onChange={e => setTempUpper(e.target.value)}
                  style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, marginBottom: 4, color: "#555" }}>Increment (mm)</label>
                <input
                  type="number"
                  value={tempIncrement}
                  onChange={e => setTempIncrement(e.target.value)}
                  style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setBoundsModalOpen(false)}
                  style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBounds}
                  style={{ padding: "6px 12px", background: "#90AF13", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thickness Multi-Select Modal */}
      {thicknessModalOpen && activeThicknessField !== null && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #90AF13",
            borderRadius: 8,
            width: 620,
            height: 520,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: '"Ubuntu Sans", sans-serif'
          }}>
            {/* Header / Title bar */}
            <div style={{
              background: "#90AF13",
              color: "#ffffff",
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>
                {activeThicknessField === 3 ? "Select Values: Web Thickness" :
                 activeThicknessField === 6 ? "Select Values: Top Flange Thickness" :
                 "Select Values: Bottom Flange Thickness"}
              </span>
              <button 
                onClick={() => setThicknessModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {/* Inner Content Area */}
            <div style={{
              background: "#f3f3f3",
              flex: 1,
              minHeight: 0,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxSizing: "border-box"
            }}>
              {/* Twin Columns with arrow buttons in between */}
              <div style={{ display: "flex", flex: 1, gap: 18, alignItems: "stretch", minHeight: 0 }}>
                {/* Available List Box */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1f1f1f" }}>Available</div>
                  <div style={{
                    background: "#ffffff",
                    border: "1px solid #c8c8c8",
                    borderRadius: 10,
                    padding: 8,
                    overflowY: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minHeight: 0
                  }}>
                    {getSortedAvailable().map(val => {
                      const isHighlighted = highlightedAvailable.includes(val);
                      return (
                        <div
                          key={val}
                          onClick={() => {
                            if (isHighlighted) {
                              setHighlightedAvailable(highlightedAvailable.filter(v => v !== val));
                            } else {
                              setHighlightedAvailable([...highlightedAvailable, val]);
                            }
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#1f1f1f",
                            background: isHighlighted ? "rgba(144, 175, 19, 0.2)" : "transparent",
                            fontWeight: isHighlighted ? 600 : "normal",
                            userSelect: "none"
                          }}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Control Buttons (Middle) */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, width: 84 }}>
                  <button
                    onClick={moveAllRight}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: "#90AF13",
                      color: "#ffffff",
                      border: "1px solid #90AF13",
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    &gt;&gt;
                  </button>
                  <button
                    onClick={moveSelectedRight}
                    disabled={highlightedAvailable.length === 0}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: highlightedAvailable.length === 0 ? "#d2d2d2" : "#cfcfcf",
                      color: highlightedAvailable.length === 0 ? "#8a8a8a" : "#6b6b6b",
                      border: "1px solid " + (highlightedAvailable.length === 0 ? "#d2d2d2" : "#cfcfcf"),
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: highlightedAvailable.length === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    &gt;
                  </button>
                  <button
                    onClick={moveSelectedLeft}
                    disabled={highlightedSelected.length === 0}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: highlightedSelected.length === 0 ? "#d2d2d2" : "#cfcfcf",
                      color: highlightedSelected.length === 0 ? "#8a8a8a" : "#6b6b6b",
                      border: "1px solid " + (highlightedSelected.length === 0 ? "#d2d2d2" : "#cfcfcf"),
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: highlightedSelected.length === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    &lt;
                  </button>
                  <button
                    onClick={moveAllLeft}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: "#90AF13",
                      color: "#ffffff",
                      border: "1px solid #90AF13",
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    &lt;&lt;
                  </button>
                </div>

                {/* Selected List Box */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1f1f1f" }}>Selected</div>
                  <div style={{
                    background: "#ffffff",
                    border: "1px solid #c8c8c8",
                    borderRadius: 10,
                    padding: 8,
                    overflowY: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minHeight: 0
                  }}>
                    {getSortedSelected().map(val => {
                      const isHighlighted = highlightedSelected.includes(val);
                      return (
                        <div
                          key={val}
                          onClick={() => {
                            if (isHighlighted) {
                              setHighlightedSelected(highlightedSelected.filter(v => v !== val));
                            } else {
                              setHighlightedSelected([...highlightedSelected, val]);
                            }
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#1f1f1f",
                            background: isHighlighted ? "rgba(144, 175, 19, 0.2)" : "transparent",
                            fontWeight: isHighlighted ? 600 : "normal",
                            userSelect: "none"
                          }}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Row */}
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleSaveThicknesses}
                  style={{
                    height: 40,
                    width: 220,
                    background: "#90AF13",
                    color: "#ffffff",
                    border: "1px solid #90AF13",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
