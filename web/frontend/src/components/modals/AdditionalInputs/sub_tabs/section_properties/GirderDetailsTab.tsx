import React, { useState, useEffect, Fragment } from "react";
import { useBridgeStore, API } from "../../../../../store/bridgeStore";
import { Label, Input, Select } from "../../SharedComponents";
import { SAIL_APPROVED_THICKNESS_VALUES, ROLLED_IS_SECTIONS, ROLLED_PROPERTIES } from "../../../../constants/memberConstants";

function parseSingleThicknessValue(valStr: any, fallback: number): number {
  if (valStr === undefined || valStr === null || valStr === "") return fallback;
  const str = String(valStr);
  const parts = str.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return fallback;
  const num = Number(parts[0]);
  return isNaN(num) ? fallback : num;
}

function calculateSectionProperties(currentSegment: any, type: string, rolledProperties?: Record<string, any>) {
  if (type === "Rolled") {
    const sectionName = currentSegment.is_section || "MB 500";
    const props = rolledProperties ? rolledProperties[sectionName] : null;
    if (!props) return null;
    return {
      mass: Number(props.mass).toFixed(2),
      area: Number(props.area).toFixed(2),
      iz: Number(props.iz).toFixed(2),
      iy: Number(props.iy).toFixed(2),
      rz: Number(props.rz).toFixed(2),
      ry: Number(props.ry).toFixed(2),
      zz: Number(props.zz).toFixed(2),
      zy: Number(props.zy).toFixed(2),
      zpz: Number(props.zpz).toFixed(2),
      zpy: Number(props.zpy).toFixed(2),
      it: Number(props.it).toFixed(2),
      iw: Number(props.iw).toFixed(2)
    };
  }

  // Welded formulas
  const depth = Number(currentSegment.depth ?? currentSegment.total_depth_mm ?? 1500);
  const top_width = Number(currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm ?? 400);
  const bottom_width = Number(currentSegment.bottom_flange_width ?? currentSegment.bottom_flange_width_mm ?? 400);
  const web_thickness = parseSingleThicknessValue(currentSegment.web_thickness_value ?? currentSegment.web_thickness_value_mm, 12);
  const top_thickness = parseSingleThicknessValue(currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm, 20);
  const bottom_thickness = parseSingleThicknessValue(currentSegment.bottom_flange_thickness_value ?? currentSegment.bottom_thickness_value_mm, 20);

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

  const torsion_constant_cm4 = ((top_width * Math.pow(top_thickness, 3)) / 3.0 + (bottom_width * Math.pow(bottom_thickness, 3)) / 3.0 + (h_web * Math.pow(web_thickness, 3)) / 3.0) / 10000.0;

  const warping_constant_cm6 = (((top_width * Math.pow(top_thickness, 3)) + (bottom_width * Math.pow(bottom_thickness, 3))) * Math.pow(h_web, 2) / 24.0) / 1000000.0;

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
    zpy: zpl_minor.toFixed(2),
    it: torsion_constant_cm4.toFixed(2),
    iw: warping_constant_cm6.toFixed(2)
  };
}

interface GirderDetailsTabProps {
  memberProps: any;
  setMemberProps: React.Dispatch<React.SetStateAction<any>>;
  updateGirderField: (gId: string, segIdx: number, field: string, value: any) => void;
  form: any;
  bridgeInput: any;
  rolledProperties: Record<string, any>;
  rolledIsSections: string[];
}

export default function GirderDetailsTab({
  memberProps,
  setMemberProps,
  updateGirderField,
  form,
  bridgeInput,
  rolledProperties,
  rolledIsSections,
}: GirderDetailsTabProps) {
  const designMode = useBridgeStore(state => state.designMode);
  const isOptimized = designMode === "Optimized";

  const [selectedGirder, setSelectedGirder] = useState<string>("G1");
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(0);
  const [girderCadMode, setGirderCadMode] = useState<"side" | "cross">("side");

  // Local state for range bounds modal
  const [boundsModalOpen, setBoundsModalOpen] = useState<boolean>(false);
  const [boundsField, setBoundsField] = useState<"total_depth" | "top_flange_width" | "bottom_flange_width" | null>(null);
  const [tempLower, setTempLower] = useState<string>("");
  const [tempUpper, setTempUpper] = useState<string>("");
  const [tempIncrement, setTempIncrement] = useState<string>("");

  // Thickness Multi-Select Modal state
  const [thicknessModalOpen, setThicknessModalOpen] = useState<boolean>(false);
  const [activeThicknessField, setActiveThicknessField] = useState<string | null>(null); // "web_thickness_value" | "top_flange_thickness_value" | "bottom_flange_thickness_value"
  const [tempSelectedThicknesses, setTempSelectedThicknesses] = useState<string[]>([]);
  const [highlightedAvailable, setHighlightedAvailable] = useState<string[]>([]);
  const [highlightedSelected, setHighlightedSelected] = useState<string[]>([]);

  const handleOpenThicknessDialog = (fieldName: string, currentVal: any) => {
    setActiveThicknessField(fieldName);
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
    
    const suffix = activeThicknessField === "web_thickness_value" ? "web_thickness_value_mm" :
                   activeThicknessField === "top_flange_thickness_value" ? "top_thickness_value_mm" :
                   "bottom_thickness_value_mm";
    
    updateGirderField(selectedGirder, safeSegmentIndex, activeThicknessField, joined);
    updateGirderField(selectedGirder, safeSegmentIndex, suffix, joined);

    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
      if (activeThicknessField === "top_flange_thickness_value") {
        updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", joined);
        updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_value_mm", joined);
      } else if (activeThicknessField === "bottom_flange_thickness_value") {
        updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_value", joined);
        updateGirderField(selectedGirder, safeSegmentIndex, "top_thickness_value_mm", joined);
      }
    }

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

  const activeRolledProperties = Object.keys(rolledProperties).length > 0 ? rolledProperties : ROLLED_PROPERTIES;
  const activeRolledIsSections = rolledIsSections.length > 0 ? rolledIsSections : ROLLED_IS_SECTIONS;

  const girderDetails = memberProps?.girder_details?.[selectedGirder] || {};
  const segments = girderDetails.segments || [];
  const safeSegmentIndex = Math.max(0, Math.min(selectedSegmentIndex, segments.length - 1));
  const currentSegment = segments[safeSegmentIndex] || {};

  const handleOpenBoundsDialog = (field: "total_depth" | "top_flange_width" | "bottom_flange_width") => {
    const boundsKey = `${field}_bounds`;
    const defaults: Record<string, { lower: number; upper: number; increment: number }> = {
      total_depth: { lower: 200, upper: 2000, increment: 25 },
      top_flange_width: { lower: 100, upper: 1000, increment: 10 },
      bottom_flange_width: { lower: 100, upper: 1000, increment: 10 }
    };
    const currentBounds = currentSegment[boundsKey] || defaults[field];
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
    updateGirderField(selectedGirder, safeSegmentIndex, boundsKey, { lower, upper, increment });

    // Symmetry bounds propagation
    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
      if (boundsField === "top_flange_width") {
        updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width_bounds", { lower, upper, increment });
      } else if (boundsField === "bottom_flange_width") {
        updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width_bounds", { lower, upper, increment });
      }
    }

    setBoundsModalOpen(false);
  };

  // ── Segment splitting and deletion ───────────────────────────────────────
  const handleSplitSegment = (idx: number) => {
    if (!memberProps) return;
    const nextGirderDetails = { ...memberProps.girder_details };
    const nextStiffenerDetails = { ...memberProps.stiffener_details };
    const gDetails = { ...nextGirderDetails[selectedGirder] };
    const segs = [...(gDetails.segments || [])];
    if (segs.length === 0 || idx < 0 || idx >= segs.length) return;

    const target = segs[idx];
    const mid = Number(((target.start + target.end) / 2).toFixed(3));
    const oldEnd = target.end;

    target.end = mid;
    target.length = Number((mid - target.start).toFixed(3));

    const newSeg = {
      ...target,
      id: "",
      start: mid,
      end: oldEnd,
      length: Number((oldEnd - mid).toFixed(3))
    };

    segs.splice(idx + 1, 0, newSeg);

    segs.forEach((s, sIdx) => {
      s.id = `${selectedGirder}M${sIdx + 1}`;
    });

    gDetails.segments = segs;
    nextGirderDetails[selectedGirder] = gDetails;

    const updatedStiffeners: Record<string, any> = {};
    Object.keys(nextStiffenerDetails).forEach(key => {
      if (key.startsWith(selectedGirder + "M")) {
        const mNum = Number(key.replace(selectedGirder + "M", ""));
        if (mNum > idx + 1) {
          updatedStiffeners[`${selectedGirder}M${mNum + 1}`] = nextStiffenerDetails[key];
        } else {
          updatedStiffeners[key] = nextStiffenerDetails[key];
        }
      } else {
        updatedStiffeners[key] = nextStiffenerDetails[key];
      }
    });

    const oldStiffId = `${selectedGirder}M${idx + 1}`;
    const newStiffId = `${selectedGirder}M${idx + 2}`;
    updatedStiffeners[newStiffId] = JSON.parse(JSON.stringify(nextStiffenerDetails[oldStiffId] || {}));

    setMemberProps({
      ...memberProps,
      girder_details: nextGirderDetails,
      stiffener_details: updatedStiffeners
    });
  };

  const handleDeleteSegment = (idx: number) => {
    if (!memberProps) return;
    const nextGirderDetails = { ...memberProps.girder_details };
    const nextStiffenerDetails = { ...memberProps.stiffener_details };
    const gDetails = { ...nextGirderDetails[selectedGirder] };
    const segs = [...(gDetails.segments || [])];

    if (segs.length <= 1 || idx < 0 || idx >= segs.length) return;

    const target = segs[idx];

    if (idx > 0) {
      segs[idx - 1].end = target.end;
      segs[idx - 1].length = Number((target.end - segs[idx - 1].start).toFixed(3));
    } else {
      segs[idx + 1].start = 0;
      segs[idx + 1].length = segs[idx + 1].end;
    }

    segs.splice(idx, 1);

    segs.forEach((s, sIdx) => {
      s.id = `${selectedGirder}M${sIdx + 1}`;
    });

    gDetails.segments = segs;
    nextGirderDetails[selectedGirder] = gDetails;

    const updatedStiffeners: Record<string, any> = {};
    Object.keys(nextStiffenerDetails).forEach(key => {
      if (key.startsWith(selectedGirder + "M")) {
        const mNum = Number(key.replace(selectedGirder + "M", ""));
        if (mNum === idx + 1) {
          return;
        } else if (mNum > idx + 1) {
          updatedStiffeners[`${selectedGirder}M${mNum - 1}`] = nextStiffenerDetails[key];
        } else {
          updatedStiffeners[key] = nextStiffenerDetails[key];
        }
      } else {
        updatedStiffeners[key] = nextStiffenerDetails[key];
      }
    });

    setMemberProps({
      ...memberProps,
      girder_details: nextGirderDetails,
      stiffener_details: updatedStiffeners
    });
    setSelectedSegmentIndex(0);
  };

  const handleUpdateSegmentEnd = (idx: number, endVal: string) => {
    if (!memberProps) return;
    const val = Number(endVal);
    if (isNaN(val) || val <= 0) return;

    const nextGirderDetails = { ...memberProps.girder_details };
    const gDetails = { ...nextGirderDetails[selectedGirder] };
    const segs = [...(gDetails.segments || [])];
    if (segs.length === 0 || idx < 0 || idx >= segs.length) return;

    const target = segs[idx];

    if (val <= target.start) return;
    if (idx < segs.length - 1 && val >= segs[idx + 1].end) return;

    target.end = val;
    target.length = Number((val - target.start).toFixed(3));

    if (idx < segs.length - 1) {
      segs[idx + 1].start = val;
      segs[idx + 1].length = Number((segs[idx + 1].end - val).toFixed(3));
    }

    gDetails.segments = segs;
    nextGirderDetails[selectedGirder] = gDetails;

    setMemberProps({
      ...memberProps,
      girder_details: nextGirderDetails
    });
  };

  // ── Copy Exterior/Interior Girders ──────────────────────────────────────
  const handleCopyExterior = () => {
    if (!memberProps) return;
    const nextGirderDetails = { ...memberProps.girder_details };
    const nextStiffenerDetails = { ...memberProps.stiffener_details };
    const sourceData = nextGirderDetails[selectedGirder];
    const numGirders = Number(form.noOfGirders) || 4;

    const targets = ["G1", `G${numGirders}`];
    targets.forEach(gId => {
      if (gId === selectedGirder) return;
      nextGirderDetails[gId] = JSON.parse(JSON.stringify(sourceData || {}));
      const segs = nextGirderDetails[gId]?.segments || [];
      segs.forEach((s: any, sIdx: number) => {
        s.id = `${gId}M${sIdx + 1}`;
        const sourceStiffId = `${selectedGirder}M${sIdx + 1}`;
        const targetStiffId = `${gId}M${sIdx + 1}`;
        if (nextStiffenerDetails[sourceStiffId]) {
          nextStiffenerDetails[targetStiffId] = JSON.parse(JSON.stringify(nextStiffenerDetails[sourceStiffId]));
        }
      });
    });

    setMemberProps({
      ...memberProps,
      girder_details: nextGirderDetails,
      stiffener_details: nextStiffenerDetails
    });
    alert("Copied selected girder properties to all exterior girders.");
  };

  const handleCopyInterior = () => {
    if (!memberProps) return;
    const nextGirderDetails = { ...memberProps.girder_details };
    const nextStiffenerDetails = { ...memberProps.stiffener_details };
    const sourceData = nextGirderDetails[selectedGirder];
    const numGirders = Number(form.noOfGirders) || 4;

    for (let i = 2; i < numGirders; i++) {
      const gId = `G${i}`;
      if (gId !== selectedGirder) {
        nextGirderDetails[gId] = JSON.parse(JSON.stringify(sourceData || {}));
        const segs = nextGirderDetails[gId]?.segments || [];
        segs.forEach((s: any, sIdx: number) => {
          s.id = `${gId}M${sIdx + 1}`;
          const sourceStiffId = `${selectedGirder}M${sIdx + 1}`;
          const targetStiffId = `${gId}M${sIdx + 1}`;
          if (nextStiffenerDetails[sourceStiffId]) {
            nextStiffenerDetails[targetStiffId] = JSON.parse(JSON.stringify(nextStiffenerDetails[sourceStiffId]));
          }
        });
      }
    }

    setMemberProps({
      ...memberProps,
      girder_details: nextGirderDetails,
      stiffener_details: nextStiffenerDetails
    });
    alert("Copied selected girder properties to all interior girders.");
  };

  // helper to render dynamic I-beam
  const renderIBeamDiagram = () => {
    const isWelded = (girderDetails.type || "Welded") === "Welded";
    
    if (isWelded && (!(currentSegment.depth ?? currentSegment.total_depth_mm) || !(currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm) || !(currentSegment.bottom_flange_width ?? currentSegment.bottom_flange_width_mm))) {
      return (
        <div style={{
          height: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 12,
          textAlign: "center"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Select a section to preview</div>
          <div>Enter depth and flange widths</div>
        </div>
      );
    }

    const rolledProp = !isWelded ? activeRolledProperties[currentSegment.is_section || "MB 500"] : null;

    const tfw_val = isWelded ? Number(currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm ?? 400) : rolledProp?.tfw || 180;
    const bfw_val = isWelded ? Number(currentSegment.bottom_flange_width ?? currentSegment.bottom_flange_width_mm ?? 400) : rolledProp?.bfw || 180;
    const depth_val = isWelded ? Number(currentSegment.depth ?? currentSegment.total_depth_mm ?? 1500) : rolledProp?.depth || 500;
    const tft_val = isWelded ? parseSingleThicknessValue(currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm, 20) : rolledProp?.tft || 17.2;
    const bft_val = isWelded ? parseSingleThicknessValue(currentSegment.bottom_flange_thickness_value ?? currentSegment.bottom_thickness_value_mm, 20) : rolledProp?.bft || 17.2;
    const wt_val = isWelded ? parseSingleThicknessValue(currentSegment.web_thickness_value ?? currentSegment.web_thickness_value_mm, 12) : rolledProp?.wt || 10.2;

    // scaling coordinates
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

    return (
      <svg viewBox="0 0 360 220" width="100%" height="220" style={{ background: "#ffffff" }}>
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

        {/* Girder Drawing */}
        {/* Top flange */}
        <rect x={CenterX - topW / 2} y={yTop} width={topW} height={topT} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        {/* Web */}
        <rect x={CenterX - webW / 2} y={yTopInner} width={webW} height={yBotInner - yTopInner} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        {/* Bottom flange */}
        <rect x={CenterX - botW / 2} y={yBotInner} width={botW} height={botT} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />

        {/* Girder Type Label */}
        <text x={180} y={212} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#555">
          {isWelded ? "Welded section" : `Rolled section · ${currentSegment.is_section || "MB 500"}`}
        </text>
      </svg>
    );
  };

  const renderSectionPropertiesBox = () => {
    const props = calculateSectionProperties(currentSegment, girderDetails.type || "Welded", activeRolledProperties);
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
      { label: <span>Plastic Modulus, Z<sub>uy</sub> (cm<sup>3</sup>)</span>, value: props.zpy },
      { label: <span>Torsion Constant, I<sub>t</sub> (cm<sup>4</sup>)</span>, value: props.it },
      { label: <span>Warping Constant, I<sub>w</sub> (cm<sup>6</sup>)</span>, value: props.iw },
    ];

    return (
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginBottom: 12 }}>
          Section Properties:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", rowGap: 10, columnGap: 16, alignItems: "center" }}>
          {items.map((item, idx) => (
            <Fragment key={idx}>
              <div style={{ fontSize: 11, color: "#2f2f2f", fontWeight: 600 }}>{item.label}</div>
              <Input value={item.value} disabled={false} readOnly />
            </Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #cfcfcf",
      borderRadius: 10,
      padding: 18,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      rowGap: 16,
      columnGap: 16,
      boxSizing: "border-box"
    }}>
      {/* INTERACTIVE CAD PREVIEW */}
      <div style={{
          background: "#ffffff",
          border: "1px solid #b0b0b0",
          borderRadius: 6,
          padding: 12,
          display: "flex",
          gap: 16,
          alignItems: "center",
          gridColumn: "span 2"
        }}>
          {/* RENDER DYNAMIC SVG */}
          <div style={{
            background: "#f8f8f8",
            height: 160,
            border: "1px solid #d8d8d8",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            overflow: "hidden"
          }}>
            {girderCadMode === "side" ? (
              <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet">
                {/* Draw horizontal girder */}
                {(() => {
                  const totalLength = Number(bridgeInput?.span_length ?? "35");
                  const segList = memberProps?.girder_details?.[selectedGirder]?.segments || [];
                  let currentX = 10;
                  const widthFactor = 580 / totalLength;

                  return segList.map((seg: any, idx: number) => {
                    const segWidth = seg.length * widthFactor;
                    const isSelected = idx === safeSegmentIndex;
                    const xVal = currentX;
                    currentX += segWidth;

                    return (
                      <g key={seg.id} style={{ cursor: "pointer" }} onClick={() => setSelectedSegmentIndex(idx)}>
                        {/* Top Flange */}
                        <rect
                          x={xVal}
                          y={24}
                          width={segWidth}
                          height={18}
                          fill="#c9c9c9"
                          stroke="#3a3a3a"
                          strokeWidth="1"
                        />
                        {/* Web */}
                        <rect
                          x={xVal}
                          y={42}
                          width={segWidth}
                          height={42}
                          fill="#dcdcdc"
                          stroke="#3a3a3a"
                          strokeWidth="1"
                        />
                        {/* Bottom Flange */}
                        <rect
                          x={xVal}
                          y={84}
                          width={segWidth}
                          height={18}
                          fill="#c9c9c9"
                          stroke="#3a3a3a"
                          strokeWidth="1"
                        />

                        {/* Highlight Selected */}
                        {isSelected && (
                          <rect
                            x={xVal + 1}
                            y={24.5}
                            width={segWidth - 2}
                            height={77}
                            fill="rgba(144, 175, 19, 0.16)"
                            stroke="#6f850f"
                            strokeWidth="2"
                          />
                        )}

                        {/* Text */}
                        <text
                          x={xVal + segWidth / 2}
                          y={66}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight={isSelected ? 700 : 500}
                          fill="#121212"
                        >
                          {seg.id} ({Number(seg.length).toFixed(2)} m)
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet">
                {/* Draw I-Beam cross section based on dimensions */}
                {(() => {
                  const seg = memberProps?.girder_details?.[selectedGirder]?.segments?.[safeSegmentIndex] || {};
                  const isWelded = (memberProps?.girder_details?.[selectedGirder]?.type || "Welded") === "Welded";

                  const rolledProp = !isWelded ? activeRolledProperties[seg.is_section || "MB 500"] : null;

                  const topW = isWelded ? Number(seg.top_flange_width ?? seg.top_flange_width_mm ?? 400) : rolledProp?.tfw || 180;
                  const botW = isWelded ? Number(seg.bottom_flange_width ?? seg.bottom_flange_width_mm ?? 400) : rolledProp?.bfw || 180;
                  const depth = isWelded ? Number(seg.depth ?? seg.total_depth_mm ?? 1500) : rolledProp?.depth || 500;
                  const webT = isWelded ? parseSingleThicknessValue(seg.web_thickness_value ?? seg.web_thickness_value_mm, 12) : rolledProp?.wt || 10.2;
                  const topT = isWelded ? parseSingleThicknessValue(seg.top_flange_thickness_value ?? seg.top_thickness_value_mm, 20) : rolledProp?.tft || 17.2;
                  const botT = isWelded ? parseSingleThicknessValue(seg.bottom_flange_thickness_value ?? seg.bottom_thickness_value_mm, 20) : rolledProp?.bft || 17.2;

                  const scaleY = 70 / depth;
                  const scaleX = 140 / Math.max(topW, botW);

                  const svgTopW = topW * scaleX;
                  const svgBotW = botW * scaleX;
                  const svgDepth = depth * scaleY;
                  const svgTopT = topT * scaleY;
                  const svgBotT = botT * scaleY;
                  const svgWebT = webT * scaleX;

                  const cx = 200;
                  const cy = 55;

                  const yTop = cy - svgDepth / 2;
                  const yBot = cy + svgDepth / 2;

                  return (
                    <g>
                      {/* Top Flange */}
                      <rect x={cx - svgTopW / 2} y={yTop} width={svgTopW} height={svgTopT} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                      {/* Web */}
                      <rect x={cx - svgWebT / 2} y={yTop + svgTopT} width={svgWebT} height={svgDepth - svgTopT - svgBotT} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                      {/* Bottom Flange */}
                      <rect x={cx - svgBotW / 2} y={yBot - svgBotT} width={svgBotW} height={svgBotT} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />

                      {/* Depth dimension lines */}
                      <line x1={cx - Math.max(svgTopW, svgBotW) / 2 - 25} y1={yTop} x2={cx - Math.max(svgTopW, svgBotW) / 2 - 25} y2={yBot} stroke="#90AF13" strokeWidth="1" />
                      <line x1={cx - Math.max(svgTopW, svgBotW) / 2 - 30} y1={yTop} x2={cx - Math.max(svgTopW, svgBotW) / 2 - 20} y2={yTop} stroke="#90AF13" strokeWidth="1" />
                      <line x1={cx - Math.max(svgTopW, svgBotW) / 2 - 30} y1={yBot} x2={cx - Math.max(svgTopW, svgBotW) / 2 - 20} y2={yBot} stroke="#90AF13" strokeWidth="1" />
                      <text x={cx - Math.max(svgTopW, svgBotW) / 2 - 40} y={cy + 4} fontSize="9" textAnchor="end" fill="#90AF13" fontWeight="bold">d = {depth}mm</text>

                      {/* Top Flange width dimension line */}
                      <line x1={cx - svgTopW / 2} y1={yTop - 12} x2={cx + svgTopW / 2} y2={yTop - 12} stroke="#90AF13" strokeWidth="1" />
                      <line x1={cx - svgTopW / 2} y1={yTop - 17} x2={cx - svgTopW / 2} y2={yTop - 7} stroke="#90AF13" strokeWidth="1" />
                      <line x1={cx + svgTopW / 2} y1={yTop - 17} x2={cx + svgTopW / 2} y2={yTop - 7} stroke="#90AF13" strokeWidth="1" />
                      <text x={cx} y={yTop - 20} fontSize="9" textAnchor="middle" fill="#90AF13" fontWeight="bold">tfw = {topW}mm</text>
                      <text x={200} y={114} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#555">
                        {isWelded ? "Welded section" : `Rolled section · ${seg.is_section || "MB 500"}`}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            )}
          </div>

          {/* Stacked View Buttons on the Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 130, flexShrink: 0 }}>
            <button
              onClick={() => setGirderCadMode("cross")}
              style={{
                width: 130,
                height: 32,
                fontSize: 12,
                borderRadius: 2,
                cursor: "pointer",
                outline: "none",
                transition: "background .15s",
                ...(girderCadMode === "cross" ? {
                  background: "#f2f2f2",
                  border: "1px solid #4a4a4a",
                  color: "#1f1f1f",
                  fontWeight: "600"
                } : {
                  background: "#ffffff",
                  border: "1px solid #8f8f8f",
                  color: "#2f2f2f",
                  fontWeight: "500"
                })
              }}
            >
              Cross Section
            </button>
            <button
              onClick={() => setGirderCadMode("side")}
              style={{
                width: 130,
                height: 32,
                fontSize: 12,
                borderRadius: 2,
                cursor: "pointer",
                outline: "none",
                transition: "background .15s",
                ...(girderCadMode === "side" ? {
                  background: "#f2f2f2",
                  border: "1px solid #4a4a4a",
                  color: "#1f1f1f",
                  fontWeight: "600"
                } : {
                  background: "#ffffff",
                  border: "1px solid #8f8f8f",
                  color: "#2f2f2f",
                  fontWeight: "500"
                })
              }}
            >
              Side View
            </button>
          </div>
        </div>

      {/* ROW 1, COL 0: LEFT PANEL (Girder Overview details) */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #b0b0b0",
        borderRadius: 6,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
          <Label>Select Girder:</Label>
          <Select
            value={selectedGirder}
            onChange={e => {
              setSelectedGirder(e.target.value);
              setSelectedSegmentIndex(0);
            }}
            options={Object.keys(memberProps?.girder_details || {})}
          />

          <Label>Total Span (m):</Label>
          <Input value={Number(bridgeInput?.span_length ?? "35").toFixed(2)} readOnly />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            onClick={handleCopyExterior}
            style={{
              flex: 1,
              height: 26,
              fontSize: 11,
              background: "#f0f0f0",
              border: "1px solid #b5b5b5",
              color: "#000000",
              borderRadius: 2,
              cursor: "pointer",
              fontWeight: 400,
              outline: "none"
            }}
          >
            Apply changes to exterior girders
          </button>
          <button
            onClick={handleCopyInterior}
            style={{
              flex: 1,
              height: 26,
              fontSize: 11,
              background: "#f0f0f0",
              border: "1px solid #b5b5b5",
              color: "#000000",
              borderRadius: 2,
              cursor: "pointer",
              fontWeight: 400,
              outline: "none"
            }}
          >
            Apply changes to interior girder
          </button>
        </div>
      </div>

      {/* ROW 1, COL 1: SEGMENTS TABLE */}
      <div style={{
          background: "#ffffff",
          border: "1px solid #b0b0b0",
          borderRadius: 6,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box"
        }}>
          <div style={{ overflowY: "auto", maxHeight: 114 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "#f3f3f3", borderBottom: "1px solid #d0d0d0", fontWeight: "bold" }}>
                  <th style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #d0d0d0", color: "#2b2b2b" }}>Member ID</th>
                  <th style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #d0d0d0", color: "#2b2b2b" }}>Start (m)</th>
                  <th style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #d0d0d0", color: "#2b2b2b" }}>End (m)</th>
                  <th style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #d0d0d0", color: "#2b2b2b" }}>Length (m)</th>
                  <th style={{ padding: "6px", textAlign: "center", color: "#2b2b2b", width: "100px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg: any, idx: number) => {
                  const isSelected = idx === safeSegmentIndex;
                  const isLast = idx === segments.length - 1;
                  return (
                    <tr
                      key={seg.id}
                      style={{
                        background: isSelected ? "#e8f0c9" : idx % 2 === 0 ? "#ffffff" : "#fbfbfb",
                        borderBottom: "1px solid #d0d0d0",
                      }}
                    >
                      <td onClick={() => setSelectedSegmentIndex(idx)} style={{ padding: "6px", textAlign: "center", cursor: "pointer", borderRight: "1px solid #d0d0d0", color: "#1f1f1f", fontWeight: isSelected ? "bold" : "normal" }}>{seg.id}</td>
                      <td onClick={() => setSelectedSegmentIndex(idx)} style={{ padding: "6px", textAlign: "center", cursor: "pointer", borderRight: "1px solid #d0d0d0", color: "#666" }}>{Number(seg.start).toFixed(2)}</td>
                      <td style={{ padding: "3px 6px", textAlign: "center", borderRight: "1px solid #d0d0d0" }}>
                        <input
                          value={seg.end}
                          onChange={e => handleUpdateSegmentEnd(idx, e.target.value)}
                          disabled={isLast}
                          style={{
                            width: "60px",
                            height: "22px",
                            textAlign: "center",
                            border: isLast ? "none" : "1px solid #c0c0c0",
                            borderRadius: 4,
                            background: isLast ? "#fafafa" : "#ffffff",
                            color: isLast ? "#666" : "#000",
                            outline: "none"
                          }}
                        />
                      </td>
                      <td onClick={() => setSelectedSegmentIndex(idx)} style={{ padding: "6px", textAlign: "center", cursor: "pointer", borderRight: "1px solid #d0d0d0", color: "#666" }}>{Number(seg.length).toFixed(2)}</td>
                      <td style={{ padding: "3px 6px", textAlign: "center", display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                        <button
                          onClick={() => handleSplitSegment(idx)}
                          title="Split this segment in two"
                          style={{
                            width: 36,
                            height: 24,
                            fontSize: 14,
                            fontWeight: "bold",
                            background: "#90AF13",
                            border: "1px solid #6f850f",
                            color: "#fff",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: "none"
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleDeleteSegment(idx)}
                          disabled={segments.length <= 1}
                          title={segments.length <= 1 ? "At least one segment is required" : "Delete segment & merge length"}
                          style={{
                            width: 36,
                            height: 24,
                            fontSize: 14,
                            fontWeight: "bold",
                            background: segments.length <= 1 ? "#cbd5e1" : "#c72626",
                            border: segments.length <= 1 ? "1px solid #cbd5e1" : "1px solid #8f1c1c",
                            color: "#fff",
                            borderRadius: 8,
                            cursor: segments.length <= 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: "none"
                          }}
                        >
                          −
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* ROW 2, COL 0: SECTION INPUTS */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #b0b0b0",
        borderRadius: 6,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box"
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#4b4b4b", display: "block" }}>
          Section Inputs:
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 14, alignItems: "center" }}>
          <Label>Member ID:</Label>
          <Select
            value={`${selectedGirder}M${safeSegmentIndex + 1}`}
            onChange={e => {
              const mId = e.target.value;
              const match = mId.match(/M(\d+)$/);
              if (match) {
                setSelectedSegmentIndex(Number(match[1]) - 1);
              }
            }}
            options={segments.map((s: any) => s.id)}
          />

          <Label>Type:</Label>
          <Select
            value={girderDetails.type || "Welded"}
            onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "type", e.target.value)}
            options={["Welded", "Rolled"]}
            disabled={isOptimized}
          />

          {/* Welded Fields */}
          {girderDetails.type !== "Rolled" && (
            <>
              <Label>Symmetry:</Label>
              <Select
                value={currentSegment.symmetry || "Girder Symmetric"}
                onChange={e => {
                  const newSym = e.target.value;
                  updateGirderField(selectedGirder, safeSegmentIndex, "symmetry", newSym);
                  if (newSym === "Girder Symmetric") {
                    const topW = currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm ?? "";
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width", topW);
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width_mm", topW);
                    
                    const topThick = currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm ?? "";
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", topThick);
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_value_mm", topThick);
                  }
                }}
                options={["Girder Symmetric", "Girder Unsymmetric"]}
                disabled={isOptimized}
              />

              <Label>Total Depth, d (mm):</Label>
              {isOptimized ? (
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
                  value={currentSegment.depth ?? currentSegment.total_depth_mm ?? ""}
                  onChange={e => {
                    updateGirderField(selectedGirder, safeSegmentIndex, "depth", e.target.value);
                    updateGirderField(selectedGirder, safeSegmentIndex, "total_depth_mm", e.target.value);
                  }}
                />
              )}

              <Label>Width of Top Flange, b<sub>ft</sub> (mm):</Label>
              {isOptimized ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenBoundsDialog("top_flange_width")}
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
                  value={currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm ?? ""}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width_mm", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width_mm", val);
                    }
                  }}
                />
              )}

              <Label>Top Flange Thickness, t<sub>ft</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={currentSegment.top_flange_thickness_mode ?? currentSegment.top_thickness_mode ?? "All"}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_mode", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_thickness_mode", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_mode", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_mode", val);
                    }
                    if (val === "Custom") {
                      handleOpenThicknessDialog("top_flange_thickness_value", currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm ?? "");
                    }
                  }}
                  options={["All", "Custom"]}
                />
              ) : (
                <Select
                  value={currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm ?? "20"}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_value", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "top_thickness_value_mm", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_value_mm", val);
                    }
                  }}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                />
              )}

              <Label>Width of Bottom Flange, b<sub>fb</sub> (mm):</Label>
              {isOptimized ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenBoundsDialog("bottom_flange_width")}
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
                  value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric")
                    ? (currentSegment.top_flange_width ?? currentSegment.top_flange_width_mm ?? "")
                    : (currentSegment.bottom_flange_width ?? currentSegment.bottom_flange_width_mm ?? "")}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width_mm", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width_mm", val);
                    }
                  }}
                />
              )}

              <Label>Bottom Flange Thickness, t<sub>fb</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric")
                    ? (currentSegment.top_flange_thickness_mode ?? currentSegment.top_thickness_mode ?? "All")
                    : (currentSegment.bottom_flange_thickness_mode ?? currentSegment.bottom_thickness_mode ?? "All")}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_mode", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_mode", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_mode", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_thickness_mode", val);
                    }
                    if (val === "Custom") {
                      handleOpenThicknessDialog("bottom_flange_thickness_value", currentSegment.bottom_flange_thickness_value ?? currentSegment.bottom_thickness_value_mm ?? "");
                    }
                  }}
                  options={["All", "Custom"]}
                />
              ) : (
                <Select
                  value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric")
                    ? (currentSegment.top_flange_thickness_value ?? currentSegment.top_thickness_value_mm ?? "20")
                    : (currentSegment.bottom_flange_thickness_value ?? currentSegment.bottom_thickness_value_mm ?? "20")}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", val);
                    updateGirderField(selectedGirder, safeSegmentIndex, "bottom_thickness_value_mm", val);
                    if ((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") {
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_value", val);
                      updateGirderField(selectedGirder, safeSegmentIndex, "top_thickness_value_mm", val);
                    }
                  }}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                />
              )}

              <Label>Support Type:</Label>
              <Select
                value={girderDetails.support_type || currentSegment.support_type || "Major Laterally Supported"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "support_type", e.target.value)}
                options={["Major Laterally Supported", "Minor Laterally Unsupported", "Major Laterally Unsupported"]}
              />

              <Label>Support Width (mm):</Label>
              <Input
                value={girderDetails.support_width ?? girderDetails.support_width_mm ?? currentSegment.support_width ?? currentSegment.support_width_mm ?? "500"}
                onChange={e => {
                  updateGirderField(selectedGirder, safeSegmentIndex, "support_width", e.target.value);
                  updateGirderField(selectedGirder, safeSegmentIndex, "support_width_mm", e.target.value);
                }}
              />

              <Label>Web Thickness, w<sub>t</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={currentSegment.web_thickness_mode ?? "All"}
                  onChange={e => {
                    const val = e.target.value;
                    updateGirderField(selectedGirder, safeSegmentIndex, "web_thickness_mode", val);
                    if (val === "Custom") {
                      handleOpenThicknessDialog("web_thickness_value", currentSegment.web_thickness_value ?? currentSegment.web_thickness_value_mm ?? "");
                    }
                  }}
                  options={["All", "Custom"]}
                />
              ) : (
                <Select
                  value={currentSegment.web_thickness_value ?? currentSegment.web_thickness_value_mm ?? "12"}
                  onChange={e => {
                    updateGirderField(selectedGirder, safeSegmentIndex, "web_thickness_value", e.target.value);
                    updateGirderField(selectedGirder, safeSegmentIndex, "web_thickness_value_mm", e.target.value);
                  }}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                />
              )}

              <Label>Web Type:</Label>
              <Select
                value={girderDetails.web_type || currentSegment.web_type || "Thick Web without ITS"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "web_type", e.target.value)}
                options={["Thin Web with ITS", "Thick Web without ITS"]}
              />
            </>
          )}

          {/* Rolled Fields */}
          {girderDetails.type === "Rolled" && (
            <>
              <Label>IS Section:</Label>
              <Select
                value={currentSegment.is_section || "MB 500"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "is_section", e.target.value)}
                options={activeRolledIsSections}
              />
            </>
          )}

          {/* Common restraint fields */}
          <Label>Torsional Restraint:</Label>
          <Select
            value={girderDetails.torsional_restraint || "Fully Restrained"}
            onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "torsional_restraint", e.target.value)}
            options={[
              "Fully Restrained",
              "Partially Restrained - Support Connection",
              "Partially Restrained - Bearing Support"
            ]}
          />

          <Label>Warping Restraint:</Label>
          <Select
            value={girderDetails.warping_restraint || "Both Flanges Restrained"}
            onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "warping_restraint", e.target.value)}
            options={["Both Flanges Restrained", "No Restraint"]}
          />
        </div>
      </div>

      {/* ROW 2, COL 1: PREVIEW DIAGRAM & PROPERTIES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Dynamic Diagram Box */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #b0b0b0",
            borderRadius: 6,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box"
          }}>
            {renderIBeamDiagram()}
          </div>

          {/* Section Properties Box */}
          {renderSectionPropertiesBox()}
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
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: 300,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: "bold", color: "#333" }}>
              Set Bounds: {boundsField === "total_depth" ? "Total Depth" : boundsField === "top_flange_width" ? "Top Flange Width" : "Bottom Flange Width"}
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
                {activeThicknessField === "web_thickness_value" ? "Select Values: Web Thickness" :
                 activeThicknessField === "top_flange_thickness_value" ? "Select Values: Top Flange Thickness" :
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
