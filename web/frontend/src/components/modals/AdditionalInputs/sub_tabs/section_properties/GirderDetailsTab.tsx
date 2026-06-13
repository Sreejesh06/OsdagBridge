import React, { useState, useEffect, Fragment } from "react";
import { useBridgeStore, API } from "../../../../../store/bridgeStore";
import { Label, Input, Select } from "../../SharedComponents";
import { SAIL_APPROVED_THICKNESS_VALUES } from "../../../../constants/memberConstants";

const DEFAULT_ROLLED_PROPERTIES: Record<string, any> = {
  "ISMB 500": { mass: 86.9, area: 110.74, depth: 500, tfw: 180, tft: 17.2, bfw: 180, bft: 17.2, wt: 10.2, iz: 45218.3, iy: 1369.8, rz: 20.2, ry: 3.52, zz: 1808.7, zy: 152.2, zpz: 2074.67, zpy: 270.83, it: 98.15, iw: 80240 },
  "ISMB 550": { mass: 103.7, area: 132.11, depth: 550, tfw: 190, tft: 19.3, bfw: 190, bft: 19.3, wt: 11.2, iz: 64893.6, iy: 1833.8, rz: 22.16, ry: 3.73, zz: 2359.8, zy: 193.0, zpz: 2711.98, zpy: 345.54, it: 150.21, iw: 120450 },
  "ISMB 600": { mass: 122.6, area: 156.0, depth: 600, tfw: 210, tft: 20.8, bfw: 210, bft: 20.8, wt: 12.0, iz: 91800.0, iy: 2650.0, rz: 24.26, ry: 4.12, zz: 3060.0, zy: 252.4, zpz: 3510.63, zpy: 451.21, it: 210.45, iw: 180210 },
  "ISWB 500": { mass: 95.2, area: 121.22, depth: 500, tfw: 250, tft: 14.7, bfw: 250, bft: 14.7, wt: 9.9, iz: 52290.9, iy: 2987.8, rz: 20.77, ry: 4.96, zz: 2091.6, zy: 239.0, zpz: 2391.24, zpy: 395.21, it: 110.12, iw: 150450 },
  "ISWB 550": { mass: 112.5, area: 143.34, depth: 550, tfw: 250, tft: 17.6, bfw: 250, bft: 17.6, wt: 10.5, iz: 83288.7, iy: 5794.6, rz: 24.11, ry: 6.35, zz: 3028.7, zy: 463.6, zpz: 3450.21, zpy: 712.54, it: 180.45, iw: 280210 },
  "ISWB 600": { mass: 133.7, area: 170.38, depth: 600, tfw: 250, tft: 21.3, bfw: 250, bft: 21.3, wt: 11.2, iz: 106198.5, iy: 4702.5, rz: 24.96, ry: 5.25, zz: 3540.0, zy: 376.2, zpz: 4110.21, zpy: 610.12, it: 220.34, iw: 350210 },
};

const DEFAULT_ROLLED_IS_SECTIONS = ["ISMB 500", "ISMB 550", "ISMB 600", "ISWB 500", "ISWB 550", "ISWB 600"];

function calculateSectionProperties(currentSegment: any, type: string, rolledProperties?: Record<string, any>) {
  if (type === "Rolled") {
    const sectionName = currentSegment.is_section || "ISMB 500";
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
  const depth = Number(currentSegment.depth || 1500);
  const top_width = Number(currentSegment.top_flange_width || 400);
  const bottom_width = Number(currentSegment.bottom_flange_width || 400);
  const web_thickness = Number(currentSegment.web_thickness_value || 12);
  const top_thickness = Number(currentSegment.top_flange_thickness_value || 20);
  const bottom_thickness = Number(currentSegment.bottom_flange_thickness_value || 20);

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
}

export default function GirderDetailsTab({
  memberProps,
  setMemberProps,
  updateGirderField,
  form,
  bridgeInput,
}: GirderDetailsTabProps) {
  const designMode = useBridgeStore(state => state.designMode);
  const isOptimized = designMode === "Optimized";

  const [selectedGirder, setSelectedGirder] = useState<string>("G1");
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(0);
  const [girderCadMode, setGirderCadMode] = useState<"side" | "cross">("side");

  const [rolledProperties, setRolledProperties] = useState<Record<string, any>>(DEFAULT_ROLLED_PROPERTIES);
  const [rolledIsSections, setRolledIsSections] = useState<string[]>(DEFAULT_ROLLED_IS_SECTIONS);

  useEffect(() => {
    const fetchRolledSections = async () => {
      try {
        const res = await fetch(`${API}/cross-section/rolled-sections`);
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setRolledProperties(data);
            setRolledIsSections(Object.keys(data).sort());
          }
        }
      } catch (err) {
        console.error("Failed to fetch rolled sections:", err);
      }
    };
    fetchRolledSections();
  }, []);

  const girderDetails = memberProps?.girder_details?.[selectedGirder] || {};
  const segments = girderDetails.segments || [];
  const safeSegmentIndex = Math.max(0, Math.min(selectedSegmentIndex, segments.length - 1));
  const currentSegment = segments[safeSegmentIndex] || {};

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
    
    if (isWelded && (!currentSegment.depth || !currentSegment.top_flange_width || !currentSegment.bottom_flange_width)) {
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

    const rolledProp = !isWelded ? rolledProperties[currentSegment.is_section || "ISMB 500"] : null;

    const tfw_val = isWelded ? Number(currentSegment.top_flange_width || 400) : rolledProp?.tfw || 180;
    const bfw_val = isWelded ? Number(currentSegment.bottom_flange_width || 400) : rolledProp?.bfw || 180;
    const depth_val = isWelded ? Number(currentSegment.depth || 1500) : rolledProp?.depth || 500;
    const tft_val = isWelded ? Number(currentSegment.top_flange_thickness_value || 20) : rolledProp?.tft || 17.2;
    const bft_val = isWelded ? Number(currentSegment.bottom_flange_thickness_value || 20) : rolledProp?.bft || 17.2;
    const wt_val = isWelded ? Number(currentSegment.web_thickness_value || 12) : rolledProp?.wt || 10.2;

    // scaling coordinates
    const CenterX = 180;
    const CenterY = 110;

    // basic proportions
    const ratio = tfw_val / bfw_val;
    let topW = 90;
    let botW = 90;
    if (ratio > 1) {
      botW = 90 / ratio;
    } else if (ratio < 1) {
      topW = 90 * ratio;
    }
    // clamp between 45 and 110
    topW = Math.max(45, Math.min(110, topW));
    botW = Math.max(45, Math.min(110, botW));

    const topT = 10;
    const botT = 10;
    const webW = 8;
    const yTop = CenterY - 50;
    const yTopInner = yTop + topT;
    const yBot = CenterY + 50;
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
        <line x1={CenterX - botW / 2} y1={yBot + 12} x2={CenterX - botW / 2} y2={yBot + 12} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX - botW / 2} y1={yBot} x2={CenterX - botW / 2} y2={yBot - 16} stroke="#90AF13" strokeWidth="1" />
        <line x1={CenterX + botW / 2} y1={yBot} x2={CenterX + botW / 2} y2={yBot - 16} stroke="#90AF13" strokeWidth="1" />
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
          {isWelded ? "Welded section" : `Rolled section · ${currentSegment.is_section || "ISMB 500"}`}
        </text>
      </svg>
    );
  };

  const renderSectionPropertiesBox = () => {
    const props = calculateSectionProperties(currentSegment, girderDetails.type || "Welded", rolledProperties);
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
              <div style={{ fontSize: 10, color: "#5a5a5a" }}>{item.label}</div>
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

                const rolledProp = !isWelded ? rolledProperties[seg.is_section || "ISMB 500"] : null;

                const topW = isWelded ? Number(seg.top_flange_width || 400) : rolledProp?.tfw || 180;
                const botW = isWelded ? Number(seg.bottom_flange_width || 400) : rolledProp?.bfw || 180;
                const depth = isWelded ? Number(seg.depth || 1500) : rolledProp?.depth || 500;
                const webT = isWelded ? Number(seg.web_thickness_value || 12) : rolledProp?.wt || 10.2;
                const topT = isWelded ? Number(seg.top_flange_thickness_value || 20) : rolledProp?.tft || 17.2;
                const botT = isWelded ? Number(seg.bottom_flange_thickness_value || 20) : rolledProp?.bft || 17.2;

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
                      {isWelded ? "Welded section" : `Rolled section · ${seg.is_section || "ISMB 500"}`}
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
          />

          {/* Welded Fields */}
          {girderDetails.type !== "Rolled" && (
            <>
              <Label>Symmetry:</Label>
              <Select
                value={currentSegment.symmetry || "Girder Symmetric"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "symmetry", e.target.value)}
                options={["Girder Symmetric", "Girder Unsymmetric"]}
              />

              <Label>Total Depth, d (mm):</Label>
              <Input
                value={currentSegment.depth || ""}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "depth", e.target.value)}
              />

              <Label>Width of Top Flange, t<sub>fw</sub> (mm):</Label>
              <Input
                value={currentSegment.top_flange_width || ""}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_width", e.target.value)}
              />

              <Label>Top Flange Thickness, t<sub>ft</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={currentSegment.top_flange_thickness_value || "8"}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_value", e.target.value)}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                />
              ) : (
                <Input
                  value={currentSegment.top_flange_thickness_value || ""}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "top_flange_thickness_value", e.target.value)}
                />
              )}

              <Label>Width of Bottom Flange, b<sub>fw</sub> (mm):</Label>
              <Input
                value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") ? currentSegment.top_flange_width || "" : currentSegment.bottom_flange_width || ""}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_width", e.target.value)}
                disabled={(currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric"}
              />

              <Label>Bottom Flange Thickness, b<sub>ft</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") ? currentSegment.top_flange_thickness_value || "8" : currentSegment.bottom_flange_thickness_value || "8"}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", e.target.value)}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                  disabled={(currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric"}
                />
              ) : (
                <Input
                  value={((currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric") ? currentSegment.top_flange_thickness_value || "" : currentSegment.bottom_flange_thickness_value || ""}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "bottom_flange_thickness_value", e.target.value)}
                  disabled={(currentSegment.symmetry || "Girder Symmetric") === "Girder Symmetric"}
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
                value={girderDetails.support_width || currentSegment.support_width || "500"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "support_width", e.target.value)}
              />

              <Label>Web Thickness, w<sub>t</sub> (mm):</Label>
              {isOptimized ? (
                <Select
                  value={currentSegment.web_thickness_value || "8"}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "web_thickness_value", e.target.value)}
                  options={SAIL_APPROVED_THICKNESS_VALUES}
                />
              ) : (
                <Input
                  value={currentSegment.web_thickness_value || ""}
                  onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "web_thickness_value", e.target.value)}
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
                value={currentSegment.is_section || "ISMB 500"}
                onChange={e => updateGirderField(selectedGirder, safeSegmentIndex, "is_section", e.target.value)}
                options={rolledIsSections}
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
    </div>
  );
}
