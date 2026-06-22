import React, { useState, useEffect } from "react";
import { Label, Input, Select } from "../../SharedComponents";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";
import { SAIL_APPROVED_THICKNESS_VALUES, ROLLED_PROPERTIES } from "../../../../constants/memberConstants";
import { useBridgeStore } from "../../../../../store/bridgeStore";

// ─── Constants ───────────────────────────────────────────────────────────────
const MIN_BEARING_SPACING_MM = 50;

// Preview colours – exactly match the PySide6 palette
const THEME_CANVAS = "#f8f8f8";
const THEME_GIRDER = "#d9d9d9";
const THEME_FLANGE = "#c9c9c9";
const THEME_WEB = "#dcdcdc";
const THEME_GIRDER_BORDER = "#3a3a3a";
const THEME_SEGMENT_LINE = "#888888";

const BEARING_COLOR = "#90AF13";      // Green
const INTERMEDIATE_COLOR = "#6B7D20"; // Dark Olive
const LONG_COLOR = "#4a4a4a";         // Dark Charcoal

const DESCRIPTION_TEXT = `Transverse Bearing Stiffeners:
• Configure count and spacing at the girder support ends to transfer heavy reactions.
• Minimum spacing is 50 mm. If spacing is left empty, the system automatically computes a spacing from the member length.

Transverse Intermediate Stiffeners:
• Set spacing (in mm) and outstand dimensions to guard against web shear buckling.
• Outstand of intermediate stiffeners must not exceed the maximum allowed outstand.

Longitudinal Stiffeners:
• Add horizontal stiffeners at 1/3 or 2/3 of the web depth to prevent web buckling under bending compression.
• Thickness modes default to "All" (automatic scope) or "Custom" (explicit SAIL approved thickness values).`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface StiffenerDetailsTabProps {
  memberProps: any;
  setMemberProps: React.Dispatch<React.SetStateAction<any>>;
  updateStiffenerField: (memberId: string, field: string, value: any) => void;
  getStiffenerMemberIds: () => string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Resolve bearing stiffener drawing params for a segment */
function resolveBearingParams(
  segStiff: any,
  segLenMm: number,
  pxPerMm: number
): { count: number; spacingPx: number; edgeOffset: number; bearingZone: number } {
  let count = parseInt(segStiff?.bearing_stiffeners_each_end) || 2;
  count = Math.max(1, Math.min(8, count));

  const customSpacingMm = parseInt(segStiff?.bearing_spacing_mm ?? "");
  let spacingMm: number;
  if (customSpacingMm && !isNaN(customSpacingMm) && customSpacingMm > 0) {
    spacingMm = customSpacingMm;
  } else {
    spacingMm = Math.max(MIN_BEARING_SPACING_MM, segLenMm / (count + 1));
  }

  const spacingPx = Math.max(8.0, Math.min(24.0, spacingMm * pxPerMm));
  const edgeOffset = spacingPx;
  const bearingZone = edgeOffset + (count - 1) * spacingPx + 6.0;
  return { count, spacingPx, edgeOffset, bearingZone };
}

/** Get section dimensions for a member from girder_details state */
function getMemberSectionDimensions(mId: string, girderDetails: any): Record<string, number> | null {
  if (!mId || !girderDetails) return null;
  const gId = mId.split("M")[0];
  const segs: any[] = girderDetails[gId]?.segments || [];
  const seg = segs.find((s: any) => s.id === mId);
  if (!seg) return null;

  const isWelded = (girderDetails[gId]?.type || "Welded") === "Welded";
  if (isWelded) {
    return {
      top_flange_width_mm: Number(seg.top_flange_width ?? seg.top_flange_width_mm ?? 400),
      bottom_flange_width_mm: Number(seg.bottom_flange_width ?? seg.bottom_flange_width_mm ?? 400),
      web_thickness_mm: Number(seg.web_thickness_value ?? seg.web_thickness_value_mm ?? 12),
      depth_mm: Number(seg.depth ?? seg.total_depth_mm ?? 1500),
      top_flange_thickness_mm: Number(seg.top_flange_thickness_value ?? seg.top_thickness_value_mm ?? 20),
      bottom_flange_thickness_mm: Number(seg.bottom_flange_thickness_value ?? seg.bottom_thickness_value_mm ?? 20),
    };
  } else {
    const sectionName = seg.is_section || "MB 500";
    const props = ROLLED_PROPERTIES[sectionName];
    if (!props) return null;
    return {
      top_flange_width_mm: Number(props.tfw),
      bottom_flange_width_mm: Number(props.bfw),
      web_thickness_mm: Number(props.wt),
      depth_mm: Number(props.depth),
      top_flange_thickness_mm: Number(props.tft),
      bottom_flange_thickness_mm: Number(props.bft),
    };
  }
}

/** Compute max outstand (mm) for a given member */
function computeOutstand(mId: string, girderDetails: any): string | null {
  const dims = getMemberSectionDimensions(mId, girderDetails);
  if (!dims) return null;
  const { top_flange_width_mm, bottom_flange_width_mm, web_thickness_mm } = dims;
  if (top_flange_width_mm <= 0 || bottom_flange_width_mm <= 0 || web_thickness_mm <= 0) return null;
  const outstand = (Math.min(top_flange_width_mm, bottom_flange_width_mm) - web_thickness_mm) / 2.0;
  if (outstand <= 0) return null;
  // Match Python formatting: strip trailing zeros
  return `${outstand.toFixed(3)}`.replace(/\.?0+$/, "");
}

// ─── Component ───────────────────────────────────────────────────────────────
const NormalLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: "#2f2f2f" }}>{children}</div>
);

export default function StiffenerDetailsTab({
  memberProps,
  setMemberProps,
  updateStiffenerField,
  getStiffenerMemberIds,
}: StiffenerDetailsTabProps) {
  const designMode = useBridgeStore((state) => state.designMode);
  const isOptimized = designMode === "Optimized";

  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("stiffener_details").then((data) => setSchema(data));
    });
  }, []);

  const memberIds = getStiffenerMemberIds();

  const [selectedStiffenerMember, setSelectedStiffenerMember] = useState<string>(() =>
    memberIds.length > 0 ? memberIds[0] : "G1M1"
  );

  // Sync selected member if it's no longer in the list
  useEffect(() => {
    if (memberIds.length > 0 && !memberIds.includes(selectedStiffenerMember)) {
      setSelectedStiffenerMember(memberIds[0]);
    }
  }, [memberIds, selectedStiffenerMember]);

  // Auto-populate empty outstand values with computed outstand (matches desktop _update_outstand_fields)
  useEffect(() => {
    if (!selectedStiffenerMember || isOptimized) return;
    const computed = computeOutstand(selectedStiffenerMember, memberProps.girder_details);
    if (computed === null) return;

    const stiff = memberProps.stiffener_details?.[selectedStiffenerMember] || {};
    const bearingEmpty = !String(stiff.bearing_outstand_mm ?? "").trim();
    const interEmpty = !String(stiff.intermediate_outstand_mm ?? "").trim();
    if (!bearingEmpty && !interEmpty) return;

    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.stiffener_details) next.stiffener_details = {};
      next.stiffener_details[selectedStiffenerMember] = {
        ...next.stiffener_details[selectedStiffenerMember],
        ...(bearingEmpty ? { bearing_outstand_mm: computed } : {}),
        ...(interEmpty ? { intermediate_outstand_mm: computed } : {}),
      };
      return next;
    });
  }, [selectedStiffenerMember, memberProps.girder_details, isOptimized]);

  // ── Derived state for selected member ───────────────────────────────────────
  const stiff = memberProps.stiffener_details?.[selectedStiffenerMember] || {};
  const girderId = selectedStiffenerMember.split("M")[0];
  const segments: any[] = memberProps?.girder_details?.[girderId]?.segments || [];
  const activeSegIndex = segments.findIndex((s: any) => s.id === selectedStiffenerMember);
  const isExterior = activeSegIndex === 0 || activeSegIndex === segments.length - 1;

  const computedOutstand = computeOutstand(selectedStiffenerMember, memberProps.girder_details);

  // Bearing auto-spacing hint
  const bearingCount = parseInt(stiff.bearing_stiffeners_each_end ?? "") || 2;
  const currentSegLength = Number(segments[activeSegIndex]?.length || 0);
  const autoBearingSpacingMm = Math.round(
    Math.max(MIN_BEARING_SPACING_MM, (currentSegLength * 1000) / (bearingCount + 1))
  );

  // Outstand validation
  const validateOutstand = (valStr: string | undefined): boolean => {
    if (!valStr || valStr.trim() === "" || isNaN(Number(valStr))) return true;
    if (computedOutstand !== null && Number(valStr) > Number(computedOutstand)) return false;
    return true;
  };
  const isBearingOutstandValid = validateOutstand(stiff.bearing_outstand_mm);
  const isInterOutstandValid = validateOutstand(stiff.intermediate_outstand_mm);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleApplyToAllCustom = () => {
    if (isOptimized) return;
    const currentStiff = memberProps.stiffener_details?.[selectedStiffenerMember] || {};
    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.stiffener_details) next.stiffener_details = {};
      memberIds.forEach((mId) => {
        next.stiffener_details[mId] = { ...currentStiff };
      });
      return next;
    });
    alert("Copied current stiffener layout properties to all member segments.");
  };

  const handleIntermediateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateStiffenerField(selectedStiffenerMember, "intermediate_stiffener", val);
    if (val === "No") {
      updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", "NA");
    } else if (String(stiff.intermediate_spacing_mm ?? "").toUpperCase() === "NA") {
      updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", "");
    }
  };

  const handleLongitudinalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStiffenerField(selectedStiffenerMember, "longitudinal_stiffener", e.target.value);
  };



  // ── CAD canvas geometry ─────────────────────────────────────────────────────
  const totalLength = segments.reduce((s: number, seg: any) => s + Number(seg.length || 0), 0);
  const pxPerMm = totalLength > 0 ? 680 / (totalLength * 1000) : 0;

  let cumulativeX = 40;
  const segmentRects = segments.map((seg: any) => {
    const width = totalLength > 0 ? (Number(seg.length) / totalLength) * 680 : 0;
    const left = cumulativeX;
    cumulativeX += width;
    return { id: seg.id as string, left, right: left + width, width, length: Number(seg.length) };
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Row 1: CAD Preview + Legend ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14 }}>

        {/* CAD Canvas */}
        <div style={{
          flex: 3,
          background: "#ffffff",
          border: "1px solid #cfcfcf",
          borderRadius: 8,
          padding: 14,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            background: THEME_CANVAS,
            border: "1px solid #dcdcdc",
            borderRadius: 6,
            minHeight: 180,
            overflow: "hidden",
          }}>
            {segments.length === 0 ? (
              <div style={{ fontSize: 12, color: "#666", textAlign: "center", padding: 20 }}>
                No member segments
              </div>
            ) : (
              <svg
                width="100%"
                height="180"
                viewBox="0 0 760 180"
                preserveAspectRatio="xMidYMid meet"
              >
                {(() => {
                  // Use active member dims for flange heights
                  const activeDims = getMemberSectionDimensions(selectedStiffenerMember, memberProps.girder_details);
                  const depth = activeDims?.depth_mm || 1500;
                  const tft = activeDims?.top_flange_thickness_mm || 20;
                  const bft = activeDims?.bottom_flange_thickness_mm || 20;

                  // Scale height: girder strip from y=50 to y=130 (80px)
                  const girderH = 80;
                  const maxFlangeH = Math.max(4, Math.round(girderH * 0.22));
                  let topFlangeH = Math.max(3, Math.min(maxFlangeH, Math.round((tft / depth) * girderH)));
                  let botFlangeH = Math.max(3, Math.min(maxFlangeH, Math.round((bft / depth) * girderH)));
                  // Clamp so web region stays workable
                  if (topFlangeH + botFlangeH > girderH - 8) {
                    const overflow = topFlangeH + botFlangeH - (girderH - 8);
                    topFlangeH = Math.max(3, topFlangeH - Math.floor(overflow / 2));
                    botFlangeH = Math.max(3, botFlangeH - Math.ceil(overflow / 2));
                  }

                  const girderY = 50;
                  const webTop = girderY + topFlangeH;
                  const webBottom = girderY + girderH - botFlangeH;
                  const webH = Math.max(1, webBottom - webTop);

                  return (
                    <>
                      {/* Girder background */}
                      <rect x="40" y={girderY} width="680" height={girderH} fill={THEME_GIRDER} />
                      {/* Top flange */}
                      <rect x="40" y={girderY} width="680" height={topFlangeH} fill={THEME_FLANGE} />
                      {/* Bottom flange */}
                      <rect x="40" y={webBottom} width="680" height={botFlangeH} fill={THEME_FLANGE} />
                      {/* Web */}
                      <rect x="40" y={webTop} width="680" height={webH} fill={THEME_WEB} />

                      {/* Girder outline */}
                      <rect x="40" y={girderY} width="680" height={girderH} fill="none" stroke={THEME_GIRDER_BORDER} strokeWidth="1" />
                      <line x1="40" y1={webTop} x2="720" y2={webTop} stroke={THEME_GIRDER_BORDER} strokeWidth="0.8" />
                      <line x1="40" y1={webBottom} x2="720" y2={webBottom} stroke={THEME_GIRDER_BORDER} strokeWidth="0.8" />

                      {/* Per-segment stiffeners */}
                      {segmentRects.map((sRect, idx) => {
                        const isSelected = sRect.id === selectedStiffenerMember;
                        const segStiff = memberProps.stiffener_details?.[sRect.id] || {};
                        const isFirst = idx === 0;
                        const isLast = idx === segmentRects.length - 1;
                        const segLenMm = sRect.length * 1000;

                        // ── Bearing stiffener params ──────────────────────────
                        // Left end (only for first segment)
                        const resolvedLeft = isFirst
                          ? resolveBearingParams(
                            memberProps.stiffener_details?.[segmentRects[0].id] || {},
                            (segmentRects[0].length || 0) * 1000,
                            pxPerMm
                          )
                          : null;

                        // Right end (only for last segment)
                        const resolvedRight = isLast
                          ? resolveBearingParams(
                            memberProps.stiffener_details?.[segmentRects[segmentRects.length - 1].id] || {},
                            (segmentRects[segmentRects.length - 1].length || 0) * 1000,
                            pxPerMm
                          )
                          : null;

                        const leftZone = resolvedLeft?.bearingZone ?? 0;
                        const rightZone = resolvedRight?.bearingZone ?? 0;

                        // Bearing lines — left end grows inward from left edge
                        const bearingLines: number[] = [];
                        if (isFirst && resolvedLeft && resolvedLeft.count > 0) {
                          for (let i = 0; i < resolvedLeft.count; i++) {
                            let xPos = sRect.left + resolvedLeft.edgeOffset + i * resolvedLeft.spacingPx;
                            xPos = Math.max(sRect.left + 2, Math.min(sRect.right - 2, xPos));
                            bearingLines.push(xPos);
                          }
                        }
                        // Bearing lines — right end grows inward from right edge
                        if (isLast && resolvedRight && resolvedRight.count > 0) {
                          for (let i = 0; i < resolvedRight.count; i++) {
                            let xPos = sRect.right - resolvedRight.edgeOffset - i * resolvedRight.spacingPx;
                            xPos = Math.max(sRect.left + 2, Math.min(sRect.right - 2, xPos));
                            bearingLines.push(xPos);
                          }
                        }

                        // Intermediate stiffener lines
                        const interLines: number[] = [];
                        const includeIntermediate = String(segStiff.intermediate_stiffener || "").trim() === "Yes";
                        const interSpacingMm = parseInt(segStiff.intermediate_spacing_mm ?? "");
                        if (includeIntermediate && interSpacingMm > 0 && segLenMm > 0) {
                          let posMm = interSpacingMm;
                          while (posMm < segLenMm) {
                            const ratio = posMm / segLenMm;
                            const xPos = sRect.left + ratio * sRect.width;
                            let skip = false;
                            if (isFirst && xPos <= sRect.left + leftZone) skip = true;
                            if (isLast && xPos >= sRect.right - rightZone) skip = true;
                            if (xPos - sRect.left <= 3 || sRect.right - xPos <= 3) skip = true;
                            if (!skip) interLines.push(xPos);
                            posMm += interSpacingMm;
                          }
                        }

                        // Longitudinal stiffener horizontal lines
                        const longMode = String(segStiff.longitudinal_stiffener || "").toLowerCase();
                        const longLines: number[] = [];
                        if (longMode.includes("2")) {
                          longLines.push(webTop + webH / 3);
                          longLines.push(webTop + (2 * webH) / 3);
                        } else if (longMode.includes("1")) {
                          longLines.push(webTop + webH / 3);
                        }

                        return (
                          <g
                            key={sRect.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedStiffenerMember(sRect.id)}
                          >
                            {/* Selected segment highlight */}
                            {isSelected && (
                              <rect
                                x={sRect.left + 1}
                                y={girderY + 0.5}
                                width={Math.max(1, sRect.width - 2)}
                                height={girderH - 1}
                                fill="rgba(144,175,19,0.12)"
                                stroke="#90AF13"
                                strokeWidth="2"
                              />
                            )}

                            {/* Segment divider */}
                            {!isLast && (
                              <line
                                x1={sRect.right} y1={girderY}
                                x2={sRect.right} y2={girderY + girderH}
                                stroke={THEME_SEGMENT_LINE}
                                strokeWidth="1"
                                strokeDasharray="3,3"
                              />
                            )}

                            {/* Segment label */}
                            <text
                              x={sRect.left + sRect.width / 2}
                              y={girderY - 6}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight={isSelected ? 700 : 500}
                              fill={isSelected ? "#90AF13" : "#333333"}
                            >
                              {sRect.id} ({sRect.length}m)
                            </text>

                            {/* Intermediate stiffeners (draw first, so bearing is on top) */}
                            {interLines.map((x, li) => (
                              <line
                                key={`inter-${li}`}
                                x1={x} y1={webTop}
                                x2={x} y2={webBottom}
                                stroke={INTERMEDIATE_COLOR}
                                strokeWidth="2"
                              />
                            ))}

                            {/* Bearing stiffeners */}
                            {bearingLines.map((x, bi) => (
                              <line
                                key={`bearing-${bi}`}
                                x1={x} y1={webTop}
                                x2={x} y2={webBottom}
                                stroke={BEARING_COLOR}
                                strokeWidth="2.5"
                              />
                            ))}

                            {/* Longitudinal stiffeners */}
                            {longLines.map((y, li) => (
                              <line
                                key={`long-${li}`}
                                x1={sRect.left} y1={y}
                                x2={sRect.right} y2={y}
                                stroke={LONG_COLOR}
                                strokeWidth="2.5"
                              />
                            ))}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        </div>

        {/* Legend Panel */}
        <div style={{
          flex: 1,
          background: "#ffffff",
          border: "1px solid #cfcfcf",
          borderRadius: 8,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>Legend</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Bearing stiffener", color: BEARING_COLOR },
              { label: "Intermediate stiffener", color: INTERMEDIATE_COLOR },
              { label: "Longitudinal stiffener", color: LONG_COLOR },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 22, height: 10,
                  borderRadius: 2,
                  background: item.color,
                  border: "1px solid #777",
                }} />
                <span style={{ fontSize: 11, color: "#444" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Form + Description ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>

        {/* Left Form Panel */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #cfcfcf",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {/* Header: Select Member + Apply button */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            rowGap: 8,
            columnGap: 14,
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: 14,
            marginBottom: 2,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2f2f2f" }}>Select Member ID:</span>
            <Select
              value={selectedStiffenerMember}
              onChange={(e) => setSelectedStiffenerMember(e.target.value)}
              options={memberIds.length > 0 ? memberIds : ["G1M1"]}
            />
            <div />
            <button
              onClick={handleApplyToAllCustom}
              disabled={isOptimized}
              style={{
                height: 28, fontSize: 11,
                borderRadius: 4, border: "1px solid #cfcfcf",
                background: isOptimized ? "#f5f5f5" : "#ffffff",
                color: isOptimized ? "#8a8a8a" : "#2b2b2b",
                cursor: isOptimized ? "not-allowed" : "pointer",
                outline: "none",
                textAlign: "center",
                transition: "border-color .15s",
              }}
              onMouseEnter={(e) => { if (!isOptimized) e.currentTarget.style.borderColor = BEARING_COLOR; }}
              onMouseLeave={(e) => { if (!isOptimized) e.currentTarget.style.borderColor = "#cfcfcf"; }}
            >
              Apply changes to all custom
            </button>
          </div>

          <span style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 2 }}>
            Stiffener Inputs
          </span>

          <div style={{ marginTop: 10 }}>
            {schema ? (
              <DynamicSchemaRenderer
                fields={(schema.stiffener_inputs || []).filter((f: any) => 
                  isExterior || !f.id.startsWith("bearing_")
                )}
                data={{
                  ...stiff,
                  bearing_count_combo: stiff.bearing_stiffeners_each_end ?? "",
                  bearing_spacing_input: stiff.bearing_spacing_mm ?? "",
                  bearing_thick_combo: stiff.bearing_thickness,
                  bearing_thick_value_combo: stiff.bearing_thickness_value,
                  bearing_outstand_input: stiff.bearing_outstand_mm ?? "",
                  intermediate_combo: stiff.intermediate_stiffener ?? "",
                  intermediate_spacing_input: stiff.intermediate_spacing_mm ?? "",
                  intermediate_thick_combo: stiff.intermediate_thickness,
                  intermediate_thick_value_combo: stiff.intermediate_thickness_value,
                  intermediate_outstand_input: stiff.intermediate_outstand_mm ?? "",
                  longitudinal_combo: stiff.longitudinal_stiffener ?? "",
                  long_thick_combo: stiff.longitudinal_thickness,
                  long_thick_value_combo: stiff.longitudinal_thickness_value,
                  thickness_values_mm: SAIL_APPROVED_THICKNESS_VALUES,
                }}
                placeholders={{
                  bearing_spacing_input: isOptimized ? "" : `Auto (${autoBearingSpacingMm} mm)`,
                  bearing_outstand_input: computedOutstand ?? "NA",
                  intermediate_spacing_input: "NA",
                  intermediate_outstand_input: computedOutstand ?? "NA",
                }}
                errors={{
                  bearing_outstand_input: !isBearingOutstandValid 
                    ? `Exceeds maximum outstand of ${computedOutstand} mm` 
                    : (computedOutstand ? <span style={{ color: "#888" }}>Max allowed outstand: {computedOutstand} mm</span> : undefined),
                  intermediate_outstand_input: (String(stiff.intermediate_stiffener ?? "") === "Yes" && !isInterOutstandValid)
                    ? `Exceeds maximum outstand of ${computedOutstand} mm`
                    : ((String(stiff.intermediate_stiffener ?? "") === "Yes" && computedOutstand) ? <span style={{ color: "#888" }}>Max allowed outstand: {computedOutstand} mm</span> : undefined),
                }}
                onChange={(fieldId, value) => {
                  if (fieldId === "bearing_count_combo") updateStiffenerField(selectedStiffenerMember, "bearing_stiffeners_each_end", value);
                  else if (fieldId === "bearing_spacing_input") updateStiffenerField(selectedStiffenerMember, "bearing_spacing_mm", value);
                  else if (fieldId === "bearing_thick_combo") updateStiffenerField(selectedStiffenerMember, "bearing_thickness", value);
                  else if (fieldId === "bearing_thick_value_combo") {
                    if (!isOptimized) updateStiffenerField(selectedStiffenerMember, "bearing_thickness", "Custom");
                    updateStiffenerField(selectedStiffenerMember, "bearing_thickness_value", value);
                  }
                  else if (fieldId === "bearing_outstand_input") updateStiffenerField(selectedStiffenerMember, "bearing_outstand_mm", value);
                  else if (fieldId === "intermediate_combo") {
                    updateStiffenerField(selectedStiffenerMember, "intermediate_stiffener", value);
                    if (value === "No") updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", "NA");
                    else if (String(stiff.intermediate_spacing_mm ?? "").toUpperCase() === "NA") updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", "");
                  }
                  else if (fieldId === "intermediate_spacing_input") updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", value);
                  else if (fieldId === "intermediate_thick_combo") updateStiffenerField(selectedStiffenerMember, "intermediate_thickness", value);
                  else if (fieldId === "intermediate_thick_value_combo") {
                    if (!isOptimized) updateStiffenerField(selectedStiffenerMember, "intermediate_thickness", "Custom");
                    updateStiffenerField(selectedStiffenerMember, "intermediate_thickness_value", value);
                  }
                  else if (fieldId === "intermediate_outstand_input") updateStiffenerField(selectedStiffenerMember, "intermediate_outstand_mm", value);
                  else if (fieldId === "longitudinal_combo") updateStiffenerField(selectedStiffenerMember, "longitudinal_stiffener", value);
                  else if (fieldId === "long_thick_combo") updateStiffenerField(selectedStiffenerMember, "longitudinal_thickness", value);
                  else if (fieldId === "long_thick_value_combo") {
                    if (!isOptimized) updateStiffenerField(selectedStiffenerMember, "longitudinal_thickness", "Custom");
                    updateStiffenerField(selectedStiffenerMember, "longitudinal_thickness_value", value);
                  }
                }}
                disabled={isOptimized}
              />
            ) : (
              <div style={{ padding: 12, fontSize: 12, color: "#666" }}>Loading schema inputs...</div>
            )}
          </div>

          {/* Web Buckling section */}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 10 }}>
            Web Buckling Details
          </span>
          <div style={{ marginTop: 10 }}>
            {schema ? (
              <DynamicSchemaRenderer
                fields={schema.web_buckling_inputs || []}
                data={{
                  method_combo: stiff.shear_buckling_method ?? ""
                }}
                onChange={(fieldId, value) => {
                  if (fieldId === "method_combo") updateStiffenerField(selectedStiffenerMember, "shear_buckling_method", value);
                }}
                disabled={isOptimized}
              />
            ) : null}
          </div>
        </div>

        {/* Right Description Panel */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #cfcfcf",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>Description</span>
          <textarea
            readOnly
            value={DESCRIPTION_TEXT}
            style={{
              flex: 1,
              width: "100%",
              minHeight: 280,
              fontSize: 11,
              color: "#333",
              background: "#ffffff",
              border: "1px solid #dcdcdc",
              borderRadius: 6,
              padding: 12,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: "1.6",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}
