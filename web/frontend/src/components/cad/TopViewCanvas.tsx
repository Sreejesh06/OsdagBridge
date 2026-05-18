import { useState } from "react";
import { useBridgeStore } from "../../store/bridgeStore";

type Props = {
  zoom: number;
  onElementHover?: (label: string, x: number, y: number) => void;
};

// Hover colors per element type
const HOVER_FILL: Record<string, string> = {
  girder:        "rgba(91,127,27,0.35)",
  end_diaphragm: "rgba(123,74,18,0.35)",
  cross_bracing: "rgba(204,122,0,0.35)",
};

const HOVER_STROKE: Record<string, string> = {
  girder:        "#90AF13",
  end_diaphragm: "#c07030",
  cross_bracing: "#e09000",
};

export default function TopViewCanvas({ zoom, onElementHover }: Props) {
  const { bridgeInput, hasDesigned } = useBridgeStore();

  // Which element type is currently hovered
  const [hovered, setHovered] = useState<string | null>(null);
  // Label tooltip state (SVG-space coords for the leader line endpoint)
  const [labelInfo, setLabelInfo] = useState<{
    type: string;
    label: string;
    lx: number; // leader line end x (SVG coords)
    ly: number; // leader line end y
    tx: number; // text x
    ty: number; // text y
  } | null>(null);

  if (!hasDesigned) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        Enter bridge inputs and click Design
      </div>
    );
  }

  const span        = bridgeInput.span_length;
  const bridgeWidth = bridgeInput.width;
  const girderCount = bridgeInput.num_girders;
  const skewAngle   = bridgeInput.skew_angle || 0;

  const svgWidth  = 900;
  const svgHeight = 400;

// Add a pixels-per-meter scale factor
const SCALE = 18; // px per meter — tune this value

const startX = 80;
const endX   = startX + span * SCALE;          // was: startX + span
const topY   = 200 - (bridgeWidth * SCALE) / 2; // was: 200 - bridgeWidth/2
const bottomY = 200 + (bridgeWidth * SCALE) / 2; // was: 200 + bridgeWidth/2

  const girderSpacing  = girderCount > 1 ? (bottomY - topY) / (girderCount - 1) : 0;
  const bracingCount   = 6;
  const bracingSpacing = (endX - startX) / (bracingCount + 1);
  const skewShiftFull  = (bottomY - topY) * Math.tan((skewAngle * Math.PI) / 180);

  // ── Hover helpers ────────────────────────────────────────────────────────
  const enter = (
    type: string,
    label: string,
    lx: number,
    ly: number,
    tx: number,
    ty: number
  ) => {
    setHovered(type);
    setLabelInfo({ type, label, lx, ly, tx, ty });
    onElementHover?.(label, 0, 0);
  };

  const leave = () => {
    setHovered(null);
    setLabelInfo(null);
    onElementHover?.("", 0, 0);
  };

  // Shared hit-area padding so thin lines are easy to hover
  const HIT = 8;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ background: "#f8f8f8" }}
    >
      {/* ── TITLE ─────────────────────────────────────────────────────────── */}
      <text x={40} y={30} fontSize="18" fontWeight="600" fill="#333">
        Top View
      </text>

      {/* ── GIRDERS ───────────────────────────────────────────────────────── */}
      {Array.from({ length: girderCount }).map((_, i) => {
        const y           = topY + i * girderSpacing;
        const skewOffset  = (y - topY) * Math.tan((skewAngle * Math.PI) / 180);
        const isHov       = hovered === "girder";
        const midX        = (startX + skewOffset + endX + skewOffset) / 2;

        return (
          <g
            key={i}
            style={{ cursor: "default" }}
            onMouseEnter={() =>
              enter(
                "girder",
                `Girder ${i + 1}`,
                midX,
                y - 14,
                midX + 10,
                y - 32
              )
            }
            onMouseLeave={leave}
          >
            {/* Invisible fat hit area */}
            <line
              x1={startX + skewOffset} y1={y}
              x2={endX   + skewOffset} y2={y}
              stroke="transparent"
              strokeWidth={HIT * 2}
            />
            {/* Visible girder line */}
            <line
              x1={startX + skewOffset} y1={y}
              x2={endX   + skewOffset} y2={y}
              stroke={isHov ? HOVER_STROKE.girder : "#5b7f1b"}
              strokeWidth={isHov ? 6 : 4}
            />
          </g>
        );
      })}

      {/* ── END DIAPHRAGMS ────────────────────────────────────────────────── */}
      {/* Left */}
      <g
        style={{ cursor: "default" }}
        onMouseEnter={() =>
          enter(
            "end_diaphragm",
            "End Diaphragm",
            startX - 10,
            (topY + bottomY) / 2,
            startX - 70,
            (topY + bottomY) / 2 - 10
          )
        }
        onMouseLeave={leave}
      >
        <line
          x1={startX} y1={topY}
          x2={startX + skewShiftFull} y2={bottomY}
          stroke="transparent" strokeWidth={HIT * 2}
        />
        <line
          x1={startX} y1={topY}
          x2={startX + skewShiftFull} y2={bottomY}
          stroke={hovered === "end_diaphragm" ? HOVER_STROKE.end_diaphragm : "#7b4a12"}
          strokeWidth={hovered === "end_diaphragm" ? 6 : 4}
        />
      </g>

      {/* Right */}
      <g
        style={{ cursor: "default" }}
        onMouseEnter={() =>
          enter(
            "end_diaphragm",
            "End Diaphragm",
            endX + 10,
            (topY + bottomY) / 2,
            endX + 20,
            (topY + bottomY) / 2 - 10
          )
        }
        onMouseLeave={leave}
      >
        <line
          x1={endX} y1={topY}
          x2={endX + skewShiftFull} y2={bottomY}
          stroke="transparent" strokeWidth={HIT * 2}
        />
        <line
          x1={endX} y1={topY}
          x2={endX + skewShiftFull} y2={bottomY}
          stroke={hovered === "end_diaphragm" ? HOVER_STROKE.end_diaphragm : "#7b4a12"}
          strokeWidth={hovered === "end_diaphragm" ? 6 : 4}
        />
      </g>

      {/* ── CROSS BRACINGS ────────────────────────────────────────────────── */}
      {Array.from({ length: bracingCount }).map((_, i) => {
        const x    = startX + (i + 1) * bracingSpacing;
        const isHov = hovered === "cross_bracing";
        const midY  = (topY + bottomY) / 2;
        const midX  = x + skewShiftFull / 2;

        return (
          <g
            key={i}
            style={{ cursor: "default" }}
            onMouseEnter={() =>
              enter(
                "cross_bracing",
                `Cross Bracing ${i + 1}`,
                midX,
                midY,
                midX + 10,
                midY - 18
              )
            }
            onMouseLeave={leave}
          >
            <line
              x1={x} y1={topY}
              x2={x + skewShiftFull} y2={bottomY}
              stroke="transparent"
              strokeWidth={HIT * 2}
            />
            <line
              x1={x} y1={topY}
              x2={x + skewShiftFull} y2={bottomY}
              stroke={isHov ? HOVER_STROKE.cross_bracing : "#cc7a00"}
              strokeWidth={isHov ? 3.5 : 2}
            />
          </g>
        );
      })}

      {/* ── HOVER LABEL (dotted leader + text box) ────────────────────────── */}
      {labelInfo && (
        <g pointerEvents="none">
          {/* Dotted leader line from element to text */}
          <line
            x1={labelInfo.lx} y1={labelInfo.ly}
            x2={labelInfo.tx} y2={labelInfo.ty}
            stroke={HOVER_STROKE[labelInfo.type] ?? "#90AF13"}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          {/* Small circle at attachment point */}
          <circle
            cx={labelInfo.lx} cy={labelInfo.ly}
            r={3}
            fill={HOVER_STROKE[labelInfo.type] ?? "#90AF13"}
          />
          {/* Text background pill */}
          <rect
            x={labelInfo.tx - 4}
            y={labelInfo.ty - 14}
            width={labelInfo.label.length * 7.5 + 8}
            height={18}
            rx={4}
            fill="white"
            stroke={HOVER_STROKE[labelInfo.type] ?? "#90AF13"}
            strokeWidth={1}
            opacity={0.95}
          />
          <text
            x={labelInfo.tx}
            y={labelInfo.ty - 2}
            fontSize="12"
            fontWeight="500"
            fill={HOVER_STROKE[labelInfo.type] ?? "#333"}
          >
            {labelInfo.label}
          </text>
        </g>
      )}

      {/* ── DIMENSIONS (unchanged) ────────────────────────────────────────── */}
      <line x1={startX} y1={bottomY + 40} x2={endX} y2={bottomY + 40} stroke="black" strokeWidth={1} />
      <text x={(startX + endX) / 2 - 50} y={bottomY + 32} fontSize="14">
        Span = {span} m
      </text>

      <line
        x1={endX + 40} y1={topY}
        x2={endX + 40 + skewShiftFull} y2={bottomY}
        stroke="black" strokeWidth={1}
      />
      <text x={endX + 50} y={(topY + bottomY) / 2} fontSize="14">
        Width = {bridgeWidth} m
      </text>
    </svg>
  );
}