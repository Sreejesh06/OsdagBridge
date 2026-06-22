import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import CrossSectionCanvas from "../cad/CrossSectionCanvas";
import { useBridgeStore, GREEN, API } from "../../store/bridgeStore";
import { ROLLED_PROPERTIES } from "../constants/memberConstants";

// Typical Section sub-tabs
import LayoutTab from "./AdditionalInputs/sub_tabs/typical_section/LayoutTab";
import CrashBarrierTab from "./AdditionalInputs/sub_tabs/typical_section/CrashBarrierTab";
import MedianTab from "./AdditionalInputs/sub_tabs/typical_section/MedianTab";
import RailingTab from "./AdditionalInputs/sub_tabs/typical_section/RailingTab";
import WearingCourseTab from "./AdditionalInputs/sub_tabs/typical_section/WearingCourseTab";
import LaneDetailsTab from "./AdditionalInputs/sub_tabs/typical_section/LaneDetailsTab";

// Member Properties sub-tabs
import GirderDetailsTab from "./AdditionalInputs/sub_tabs/section_properties/GirderDetailsTab";
import StiffenerDetailsTab from "./AdditionalInputs/sub_tabs/section_properties/StiffenerDetailsTab";
import CrossBracingDetailsTab from "./AdditionalInputs/sub_tabs/section_properties/CrossBracingDetailsTab";
import EndDiaphragmDetailsTab from "./AdditionalInputs/sub_tabs/section_properties/EndDiaphragmDetailsTab";

// Loading sub-tabs
import PermanentLoadTab from "./AdditionalInputs/sub_tabs/loading/PermanentLoadTab";
import LiveLoadTab from "./AdditionalInputs/sub_tabs/loading/LiveLoadTab";
import SeismicLoadTab from "./AdditionalInputs/sub_tabs/loading/SeismicLoadTab";
import WindLoadTab from "./AdditionalInputs/sub_tabs/loading/WindLoadTab";
import TemperatureLoadTab from "./AdditionalInputs/sub_tabs/loading/TemperatureLoadTab";
import CustomLoadTab from "./AdditionalInputs/sub_tabs/loading/CustomLoadTab";
import LoadCombinationTab from "./AdditionalInputs/sub_tabs/loading/LoadCombinationTab";

// Support Conditions sub-tab
import SupportConditionsTab from "./AdditionalInputs/sub_tabs/support_conditions/SupportConditionsTab";

// Design Options sub-tab
import DesignOptionsTab from "./AdditionalInputs/sub_tabs/design_options/DesignOptionsTab";

// Design Options (Cont.) sub-tab
import DesignOptionsContTab from "./AdditionalInputs/sub_tabs/design_options_cont/DesignOptionsContTab";

type Props = {
  open: boolean;
  onClose: () => void;
};

function normalizeMemberProperties(rawProps: any, noOfGirders: number, spanLength: number) {
  if (!rawProps || Object.keys(rawProps).length === 0) {
    return createDefaultMemberProperties(noOfGirders, spanLength);
  }

  // 1. Girder Details
  let girderDetails = rawProps.girder_details;
  if (girderDetails && girderDetails.member_state) {
    girderDetails = girderDetails.member_state;
  }

  // 2. Stiffener Details
  let stiffenerDetails = rawProps.stiffener_details;
  if (stiffenerDetails && stiffenerDetails.stiffener_by_member) {
    stiffenerDetails = stiffenerDetails.stiffener_by_member;
  }
  const normalizedStiffener: Record<string, any> = {};
  if (stiffenerDetails) {
    for (const mId in stiffenerDetails) {
      const item = stiffenerDetails[mId];
      normalizedStiffener[mId] = {
        ...item,
        bearing_thickness: item.bearing_thickness_mode !== undefined ? item.bearing_thickness_mode : (item.bearing_thickness || "All"),
        intermediate_thickness: item.intermediate_thickness_mode !== undefined ? item.intermediate_thickness_mode : (item.intermediate_thickness || "All"),
        longitudinal_thickness: item.longitudinal_thickness_mode !== undefined ? item.longitudinal_thickness_mode : (item.longitudinal_thickness || "All"),
      };
    }
  }

  // 3. Cross Bracing
  let crossBracing = rawProps.cross_bracing;
  const normalizedCrossBracing: Record<string, any> = {};

  // Initialize defaults for all pairs
  for (let i = 1; i < noOfGirders; i++) {
    const pairId = `G${i} to G${i+1}`;
    normalizedCrossBracing[pairId] = {
      design: "Optimized",
      bracing_type: "K-Bracing",
      bracing_section_type: "Angle",
      bracing_section: "ISA 5050x6",
      top_chord_enabled: false,
      top_chord_type: "Angle",
      top_chord_size: "ISA 5050x6",
      bottom_chord_enabled: true,
      bottom_chord_type: "Angle",
      bottom_chord_size: "ISA 5050x6",
      spacing: "3.0"
    };
  }

  if (crossBracing) {
    if (crossBracing.cross_bracing_by_member) {
      const byMember = crossBracing.cross_bracing_by_member;
      for (let i = 1; i < noOfGirders; i++) {
        const pairId = `G${i} to G${i+1}`;
        const baseMember = `B${i}M1`;
        if (byMember[baseMember]) {
          normalizedCrossBracing[pairId] = {
            ...normalizedCrossBracing[pairId],
            ...byMember[baseMember]
          };
        }
      }
    } else if (crossBracing.cross_bracing_by_pair) {
      const byPair = crossBracing.cross_bracing_by_pair;
      for (const pairId in byPair) {
        const normPairId = pairId.replace("-", " to ");
        normalizedCrossBracing[normPairId] = {
          ...normalizedCrossBracing[normPairId],
          ...byPair[pairId]
        };
      }
    } else if (typeof crossBracing === "object") {
      for (const k in crossBracing) {
        if (k.includes("-") || k.includes(" to ")) {
          const normKey = k.replace("-", " to ");
          normalizedCrossBracing[normKey] = {
            ...normalizedCrossBracing[normKey],
            ...crossBracing[k]
          };
        }
      }
    }
  }

  // 4. End Diaphragm
  const endDiaphragm = rawProps.end_diaphragm || {};

  return {
    girder_details: girderDetails || {},
    stiffener_details: normalizedStiffener,
    cross_bracing: normalizedCrossBracing,
    end_diaphragm: endDiaphragm,
  };
}

function serializeMemberProperties(memberProps: any) {
  if (!memberProps) return {};

  // 1. Girder Details
  const finalGirderDetails = {
    member_state: memberProps.girder_details || {}
  };

  // 2. Stiffener Details
  const serializedStiffenerDetails: Record<string, any> = {};
  const rawStiff = memberProps.stiffener_details || {};
  for (const mId in rawStiff) {
    const item = rawStiff[mId];
    serializedStiffenerDetails[mId] = {
      ...item,
      bearing_thickness_mode: item.bearing_thickness !== undefined ? item.bearing_thickness : "All",
      intermediate_thickness_mode: item.intermediate_thickness !== undefined ? item.intermediate_thickness : "All",
      longitudinal_thickness_mode: item.longitudinal_thickness !== undefined ? item.longitudinal_thickness : "All",
    };
    delete serializedStiffenerDetails[mId].bearing_thickness;
    delete serializedStiffenerDetails[mId].intermediate_thickness;
    delete serializedStiffenerDetails[mId].longitudinal_thickness;
  }
  const finalStiffenerDetails = {
    stiffener_by_member: serializedStiffenerDetails
  };

  // 3. Cross Bracing (Desktop exact serialization)
  const crossBracingState = memberProps.cross_bracing || {};
  const selectGirders = Object.keys(crossBracingState)[0] || "G1 to G2";
  const memberId = "B1M1";

  const byMember: Record<string, any> = {};
  const pairs = Object.keys(crossBracingState);

  const girders = Object.keys(memberProps.girder_details || {}).sort();
  const firstGirder = girders[0] || "G1";
  const segments = memberProps?.girder_details?.[firstGirder]?.segments || [];
  const totalSpanM = segments.reduce((sum: number, seg: any) => sum + Number(seg.length || 0), 0) || 30.0;

  pairs.forEach((pairLabel, idx) => {
    const pairIdx = idx + 1;
    const brace = crossBracingState[pairLabel] || {};
    const spacingM = parseFloat(String(brace.spacing || "3")) || 3;
    const memberCount = Math.max(1, Math.floor(totalSpanM / spacingM - 1 + 1e-9));

    for (let m = 1; m <= memberCount; m++) {
      const mId = `B${pairIdx}M${m}`;
      byMember[mId] = {
        ...brace,
        select_girders: pairLabel,
        member_id: mId
      };
    }
  });

  const activePair = selectGirders;
  const activeBrace = crossBracingState[activePair] || {};

  const finalCrossBracing = {
    select_girders: activePair,
    member_id: memberId,
    cross_bracing_by_member: byMember,
    ...activeBrace,
  };

  // 4. End Diaphragm
  const finalEndDiaphragm = memberProps.end_diaphragm || {};

  return {
    girder_details: finalGirderDetails,
    stiffener_details: finalStiffenerDetails,
    cross_bracing: finalCrossBracing,
    end_diaphragm: finalEndDiaphragm,
  };
}

const getMemberSectionDimensions = (mId: string, memberProps: any) => {
  if (!mId || !memberProps?.girder_details) return null;
  const gId = mId.split("M")[0];
  const segs = memberProps.girder_details[gId]?.segments || [];
  const seg = segs.find((s: any) => s.id === mId);
  if (!seg) return null;

  const isWelded = (memberProps.girder_details[gId]?.type || "Welded") === "Welded";

  if (isWelded) {
    const depth = Number(seg.depth ?? seg.total_depth_mm ?? 1500);
    const top_width = Number(seg.top_flange_width ?? seg.top_flange_width_mm ?? 400);
    const bottom_width = Number(seg.bottom_flange_width ?? seg.bottom_flange_width_mm ?? top_width);
    const web_thickness = Number(seg.web_thickness_value ?? seg.web_thickness_value_mm ?? 12);
    const top_thickness = Number(seg.top_flange_thickness_value ?? seg.top_thickness_value_mm ?? 20);
    const bottom_thickness = Number(seg.bottom_flange_thickness_value ?? seg.bottom_thickness_value_mm ?? top_thickness);

    return {
      top_flange_width_mm: top_width,
      bottom_flange_width_mm: bottom_width,
      web_thickness_mm: web_thickness,
      depth_mm: depth,
      top_flange_thickness_mm: top_thickness,
      bottom_flange_thickness_mm: bottom_thickness,
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
};

function createDefaultMemberProperties(noOfGirders: number, spanLength: number) {
  const girderDetails: Record<string, any> = {};
  const stiffenerDetails: Record<string, any> = {};
  const crossBracing: Record<string, any> = {};

  for (let i = 1; i <= noOfGirders; i++) {
    const gId = `G${i}`;
    girderDetails[gId] = {
      type: "Welded",
      segments: [
        {
          id: `${gId}M1`,
          start: 0,
          end: spanLength,
          length: spanLength,
          type: "Welded",
          is_section: "MB 500",
                    depth: 1500,
          total_depth_mm: 1500,
          top_flange_width: 400,
          top_flange_width_mm: 400,
          top_flange_thickness_value: 20,
          top_thickness_value_mm: 20,
          bottom_flange_width: 400,
          bottom_flange_width_mm: 400,
          bottom_flange_thickness_value: 20,
          bottom_thickness_value_mm: 20,
          web_thickness_value: 12,
          web_thickness_value_mm: 12
        }
      ]
    };
    stiffenerDetails[`${gId}M1`] = {
      bearing_stiffeners_each_end: "2",
      bearing_spacing_mm: "",
      bearing_thickness: "All",
      bearing_thickness_value: "8",
      bearing_outstand_mm: "",
      intermediate_stiffener: "No",
      intermediate_spacing_mm: "NA",
      intermediate_thickness: "All",
      intermediate_thickness_value: "8",
      intermediate_outstand_mm: "",
      longitudinal_stiffener: "No",
      longitudinal_thickness: "All",
      longitudinal_thickness_value: "8",
      shear_buckling_method: "Simple Post Critical"
    };
  }

  for (let i = 1; i < noOfGirders; i++) {
    const pairId = `G${i} to G${i+1}`;
    crossBracing[pairId] = {
      design: "Optimized",
      bracing_type: "K-Bracing",
      bracing_section_type: "Angle",
      bracing_section: "ISA 5050x6",
      top_chord_enabled: false,
      top_chord_type: "Angle",
      top_chord_size: "ISA 5050x6",
      bottom_chord_enabled: true,
      bottom_chord_type: "Angle",
      bottom_chord_size: "ISA 5050x6",
      spacing: "3.0"
    };
  }

  return {
    girder_details: girderDetails,
    stiffener_details: stiffenerDetails,
    cross_bracing: crossBracing,
    end_diaphragm: {
      type: "Cross Bracing",
      cross_design: "Optimized",
      cross_bracing_type: "K-Bracing",
      cross_bracing_section_type: "Angle",
      cross_bracing_section: "ISA 5050x6",
      cross_top_chord_checkbox: false,
      cross_top_chord_type: "Angle",
      cross_top_chord_size: "ISA 5050x6",
      cross_bottom_chord_checkbox: true,
      cross_bottom_chord_type: "Angle",
      cross_bottom_chord_size: "ISA 5050x6",
      rolled_design: "Optimized",
      rolled_is_section: "MB 500",
      welded_design: "Optimized",
      welded_symmetry: "Girder Symmetric"
    }
  };
}

export default function AdditionalInputsModal({ open, onClose }: Props) {
  const { svgUrl, hasDesigned, bridgeData, setBridgeData, setSvgUrl, bridgeInput, designMode } =
    useBridgeStore();

  const [form, setForm] = useState<Record<string, any>>({
    // Typical Section
    girderSpacing:      "",
    noOfGirders:        "",
    deckOverhangWidth:  "",
    overallBridgeWidth: "",
    deckThickness:      "",
    footpathThickness:  "",
    footpathWidth:      "",
    crashBarrierWidth:  "",
    crashBarrierType:   "",
    railingType:        "",
    railingWidth:       "",
    railingHeight:      "",
    medianPresent:      false,
    medianWidth:        "",
    medianType:         "",
    wearingCourseThickness: "",

    // Loading - Permanent
    self_weight_factor_input: "1.00",

    // Loading - Live Load
    irc_vehicle_checkboxes: {
      "Class A": true,
      "Class 70R Wheeled": true,
      "Class 70R Tracked": true,
      "Class AA Wheeled": true,
      "Class AA Tracked": true,
      "Class SV": true,
      "Class 70R Bogie": true,
    },
    custom_vehicle_table: {} as Record<string, any>,
    footpath_mode_combo: "Automatic",
    footpath_value_input: "5.00",
    braking_vehicle_checkboxes: { "Class SV": true },
    eccentricity_input: "0.00",

    // Loading - Seismic
    seismic_zone_combo: "",
    importance_factor_input: "1.0",
    soil_type_combo: "Type I \u2013 Rocky or Hard",
    time_period_input: "",
    damping_input: "2",
    response_factor_combo: "1",
    dead_load_seismic_combo: "Automatic",
    dead_load_custom_input: "",
    live_load_seismic_combo: "Automatic",
    live_load_custom_input: "",

    // Loading - Wind
    basic_wind_speed: "",
    avg_exposed_height_input: "10",
    terrain_type_combo: "Plain Terrain",
    site_topography_combo: "Flat",
    gust_factor_combo: "As per Code",
    gust_factor_value: "",
    drag_coeff_combo: "As per Code",
    drag_coeff_value: "",
    drag_coeff_ll_combo: "As per Code",
    drag_coeff_ll_value: "",
    lift_coeff_combo: "As per Code",
    lift_coeff_value: "",
    super_area_elev_combo: "Automatic",
    super_area_elev_value: "",
    super_area_plain_combo: "Automatic",
    super_area_plain_value: "",
    exposed_frontal_area_combo: "Automatic",
    exposed_frontal_area_value: "",
    wind_ecc_deck_combo: "As per Code",
    wind_ecc_deck_value: "",
    wind_ll_ecc_combo: "As per Code",
    wind_ll_ecc_value: "",

    // Loading - Temperature
    highest_max_temp_input: "",
    lowest_min_temp_input: "",
    thermal_coeff_steel_input: "12.0e-6",
    thermal_coeff_rcc_input: "12.0e-6",
    bridge_temp_min_input: "",
    bridge_temp_max_input: "",
    temp_rise_input: "",
    temp_fall_input: "",

    // Loading - Custom
    customLoads: [],

    // Loading - Combinations
    loadCombinations: {},

    // Support Conditions
    leftSupport: "Pinned",
    rightSupport: "Roller",
    bearingLength: "400",

    // Design Options
    construction_stage_combo: "Yes",
    reinforcement_material_combo: "Fe 500",
    reinforcementBounds: { lower: 8, upper: 40 },
    top_clear_cover_input: "50",
    bottom_clear_cover_input: "40",
    side_clear_cover_input: "40",
    shear_stud_yield_strength_input: "385.00",
    shear_stud_ultimate_strength_input: "495.00",
    shear_stud_diameter_combo: "20",
    shear_stud_height_input: "100.00",
    shear_stud_count_combo: "2",
    shear_stud_spacing_input: "100.00",

    // Design Options (Cont.)
    gamma_c_basic_input: "1.50",
    gamma_c_accidental_input: "1.20",
    gamma_m0_input: "1.10",
    gamma_m1_input: "1.25",
    gamma_s_input: "1.15",
    gamma_v_input: "1.25",
    gamma_flt_input: "1.00",
    gamma_mf_input: "1.35",
    load_cycles_input: "2000000.00",
    limit_input: "600.00",
    ultimate_checkboxes: {
      "Bending Resistance": true,
      "Resistance to Vertical Shear": true,
      "Resistance to Lateral-torsional Buckling": true,
      "Resistance to Transverse force": true,
      "Resistance to Longitudinal Shear": true,
      "Resistance to Fatigue": true,
    },
    service_checkboxes: {
      "Stress Limitation": true,
      "Longitudinal Shear (SLS)": true,
      "Deflection Control": true,
      "Crack Width Check": true,
    },
  });

  const [memberProps, setMemberProps] = useState<any>({});

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTopTabIndex, setActiveTopTabIndex] = useState(0);
  const [activeBottomTabIndex, setActiveBottomTabIndex] = useState(0);

  const [rolledProperties, setRolledProperties] = useState<Record<string, any>>({});
  const [rolledIsSections, setRolledIsSections] = useState<string[]>([]);

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

  const topTabs = [
    "Typical Section Details",
    "Member Properties",
    "Loading",
    "Support Conditions",
    "Analysis/Design Options",
    "Design Options (Cont.)"
  ];

  const getBottomTabs = () => {
    if (activeTopTabIndex === 0) {
      return ["Layout", "Crash Barrier", "Median", "Railing", "Wearing Course", "Lane Details"];
    }
    if (activeTopTabIndex === 1) {
      return ["Girder Details", "Stiffener Details", "Cross-Bracing Details", "End Diaphragm Details"];
    }
    if (activeTopTabIndex === 2) {
      return ["Permanent Load", "Live Load", "Seismic Load", "Wind Load", "Temperature Load", "Custom Load", "Load Combination"];
    }
    // Tabs 3, 4, 5 have no sub-tabs (single content pane)
    return [];
  };

  useEffect(() => {
    if (!open || !bridgeData) return;
    setForm((prev: Record<string, any>) => ({
      ...prev,
      // Typical Section
      girderSpacing:      String(bridgeData.girder_spacing      ?? "4"),
      noOfGirders:        String(bridgeData.no_of_girders       ?? "4"),
      deckOverhangWidth:  String(bridgeData.deck_overhang_width ?? "1"),
      overallBridgeWidth: String(bridgeData.overall_bridge_width ?? "12"),
      deckThickness:      String(bridgeData.deck_thickness      ?? "250"),
      footpathThickness:  String(bridgeData.footpath_thickness  ?? "150"),
      footpathWidth:      String(bridgeData.footpath_width      ?? "1.5"),
      crashBarrierWidth:  String(bridgeData.crash_barrier_width ?? "500"),
      crashBarrierType:   String(bridgeData.crash_barrier_type  ?? "PL-1"),
      railingType:        String(bridgeData.railing_type        ?? "IRC 5 - RCC Railing"),
      railingWidth:       String(bridgeData.railing_width       ?? "375"),
      railingHeight:      String(bridgeData.railing_height      ?? "1000"),
      medianPresent:      Boolean(bridgeData.median_present     ?? false),
      medianWidth:        String(bridgeData.median_width        ?? "1200"),
      medianType:         String(bridgeData.median_type         ?? "Raised"),
      wearingCourseThickness: String(bridgeData.wearing_course_thickness ?? "50"),

      // Loading
      self_weight_factor_input: String((bridgeData as any).self_weight_factor ?? "1.00"),
      irc_vehicle_checkboxes:   (bridgeData as any).live_load_vehicles ?? prev.irc_vehicle_checkboxes,
      custom_vehicle_table:     (bridgeData as any).live_load_vehicles_custom ?? {},
      braking_vehicle_checkboxes: (bridgeData as any).braking_vehicles ?? { "Class SV": true },
      eccentricity_input: String((bridgeData as any).eccentricity ?? "0.00"),
      footpath_mode_combo: String((bridgeData as any).footpath_mode ?? "Automatic"),
      seismic_zone_combo: String((bridgeData as any).seismic_zone ?? ""),
      importance_factor_input: String((bridgeData as any).importance_factor ?? "1.0"),
      soil_type_combo:    String((bridgeData as any).soil_type ?? "Type I \u2013 Rocky or Hard"),
      time_period_input:  String((bridgeData as any).time_period ?? ""),
      damping_input:      String((bridgeData as any).damping_percentage ?? "2"),
      response_factor_combo: String((bridgeData as any).response_factor ?? "1"),
      customLoads:        (bridgeData as any).custom_loads ?? [],
      loadCombinations:   (bridgeData as any).load_combinations ?? {},

      // Support Conditions
      leftSupport:        String((bridgeData as any).left_support   ?? "Pinned"),
      rightSupport:       String((bridgeData as any).right_support  ?? "Roller"),
      bearingLength:      String((bridgeData as any).bearing_length ?? "400"),

      // Design Options
      construction_stage_combo:            String((bridgeData as any).construction_stage          ?? "Yes"),
      reinforcement_material_combo:        String((bridgeData as any).reinforcement_material      ?? "Fe 500"),
      top_clear_cover_input:               String((bridgeData as any).top_clear_cover             ?? "50"),
      bottom_clear_cover_input:            String((bridgeData as any).bottom_clear_cover          ?? "40"),
      side_clear_cover_input:              String((bridgeData as any).side_clear_cover            ?? "40"),
      shear_stud_yield_strength_input:     String((bridgeData as any).shear_stud_yield_strength   ?? "385.00"),
      shear_stud_ultimate_strength_input:  String((bridgeData as any).shear_stud_ultimate_strength ?? "495.00"),
      shear_stud_diameter_combo:           String((bridgeData as any).shear_stud_diameter         ?? "20"),
      shear_stud_height_input:             String((bridgeData as any).shear_stud_height           ?? "100.00"),
      shear_stud_count_combo:              String((bridgeData as any).shear_stud_count            ?? "2"),
      shear_stud_spacing_input:            String((bridgeData as any).shear_stud_transverse_spacing ?? "100.00"),

      // Design Options (Cont.)
      gamma_c_basic_input:      String((bridgeData as any).gamma_c_basic     ?? "1.50"),
      gamma_c_accidental_input: String((bridgeData as any).gamma_c_accidental ?? "1.20"),
      gamma_m0_input:           String((bridgeData as any).gamma_m0          ?? "1.10"),
      gamma_m1_input:           String((bridgeData as any).gamma_m1          ?? "1.25"),
      gamma_s_input:            String((bridgeData as any).gamma_s           ?? "1.15"),
      gamma_v_input:            String((bridgeData as any).gamma_v           ?? "1.25"),
      gamma_flt_input:          String((bridgeData as any).gamma_flt         ?? "1.00"),
      gamma_mf_input:           String((bridgeData as any).gamma_mf          ?? "1.35"),
      load_cycles_input:        String((bridgeData as any).load_cycles       ?? "2000000.00"),
      limit_input:              String((bridgeData as any).deflection_limit  ?? "600.00"),
      ultimate_checkboxes:      (bridgeData as any).ultimate_limit_states    ?? prev.ultimate_checkboxes,
      service_checkboxes:       (bridgeData as any).serviceability_limit_states ?? prev.service_checkboxes,
    }));

    const initialMemberProps = normalizeMemberProperties(
      bridgeData.member_properties,
      Number(bridgeData.no_of_girders ?? 4),
      Number(bridgeData.span_length ?? 35)
    );
    setMemberProps(initialMemberProps);

    setPreviewUrl(svgUrl ? `${svgUrl}&t=${Date.now()}` : "");
  }, [open]);

  const generatePreview = useCallback(async (currentForm: typeof form, currentMemberProps: any) => {
    setPreviewLoading(true);
    try {
      const payload = {
        ...bridgeData,
        girder_spacing:       Number(currentForm.girderSpacing),
        no_of_girders:        Number(currentForm.noOfGirders),
        deck_overhang_width:  Number(currentForm.deckOverhangWidth),
        overall_bridge_width: Number(currentForm.overallBridgeWidth),
        deck_thickness:       Number(currentForm.deckThickness),
        footpath_thickness:   Number(currentForm.footpathThickness),
        footpath_width:       Number(currentForm.footpathWidth),

        crash_barrier_width:  Number(currentForm.crashBarrierWidth),
        crash_barrier_type:   currentForm.crashBarrierType,
        railing_type:         currentForm.railingType,
        railing_width:        Number(currentForm.railingWidth),
        railing_height:       Number(currentForm.railingHeight),
        median_present:       currentForm.medianPresent,
        median_width:         Number(currentForm.medianWidth),
        median_type:          currentForm.medianType,
        wearing_course_thickness: Number(currentForm.wearingCourseThickness),

        member_properties:    serializeMemberProperties(currentMemberProps),
      };

      const res = await fetch(`${API}/cross-section/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        setPreviewUrl(`${API}/cross-section/svg?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Preview generation failed:", err);
    } finally {
      setPreviewLoading(false);
    }
  }, [bridgeData]);

  // Debounced effect for live preview updates when form or memberProps changes
  useEffect(() => {
    if (!open) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      generatePreview(form, memberProps);
    }, 600);
  }, [form, memberProps, open, generatePreview]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateGirderField = (gId: string, segIdx: number, field: string, value: any) => {
    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.girder_details) next.girder_details = {};
      if (!next.girder_details[gId]) next.girder_details[gId] = {};
      const segments = [...(next.girder_details[gId].segments || [])];
      if (segments[segIdx]) {
        segments[segIdx] = {
          ...segments[segIdx],
          [field]: value
        };
      }
      
      const girderLevelFields = [
        "type",
        "torsional_restraint",
        "warping_restraint",
        "web_type",
        "support_type",
        "support_width",
        "support_width_mm"
      ];
      
      const updatedGirder = {
        ...next.girder_details[gId],
        segments
      };
      
      if (girderLevelFields.includes(field)) {
        updatedGirder[field] = value;
      }
      
      next.girder_details[gId] = updatedGirder;
      return next;
    });
  };

  const updateStiffenerField = (memberId: string, field: string, value: any) => {
    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.stiffener_details) next.stiffener_details = {};
      if (!next.stiffener_details[memberId]) next.stiffener_details[memberId] = {};
      next.stiffener_details[memberId] = {
        ...next.stiffener_details[memberId],
        [field]: value
      };
      return next;
    });
  };

  const updateBracingField = (pairId: string, field: string, value: any) => {
    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.cross_bracing) next.cross_bracing = {};
      if (!next.cross_bracing[pairId]) next.cross_bracing[pairId] = {};
      next.cross_bracing[pairId] = {
        ...next.cross_bracing[pairId],
        [field]: value
      };
      return next;
    });
  };

  const updateEndDiaphragmField = (field: string, value: any) => {
    setMemberProps((prev: any) => {
      const next = { ...prev };
      if (!next.end_diaphragm) next.end_diaphragm = {};
      next.end_diaphragm = {
        ...next.end_diaphragm,
        [field]: value
      };
      return next;
    });
  };

  const getStiffenerMemberIds = () => {
    const ids: string[] = [];
    if (memberProps?.girder_details) {
      Object.keys(memberProps.girder_details).sort().forEach(gId => {
        const segs = memberProps.girder_details[gId]?.segments || [];
        segs.forEach((seg: any) => {
          ids.push(seg.id);
        });
      });
    }
    return ids;
  };

  // (selectedBracingPair is now managed internally by CrossBracingDetailsTab)

  const handleDefaults = () => {
    const defaults: Record<string, any> = {
      // Typical Section
      girderSpacing:      "4",
      noOfGirders:        "4",
      deckOverhangWidth:  "1",
      overallBridgeWidth: "12",
      deckThickness:      "250",
      footpathThickness:  "150",
      footpathWidth:      "1.5",
      crashBarrierWidth:  "500",
      crashBarrierType:   "PL-1",
      railingType:        "IRC 5 - RCC Railing",
      railingWidth:       "375",
      railingHeight:      "1000",
      medianPresent:      false,
      medianWidth:        "1200",
      medianType:         "Raised",
      wearingCourseThickness: "50",

      // Loading - Permanent
      self_weight_factor_input: "1.00",

      // Loading - Live
      irc_vehicle_checkboxes: { "Class A": true, "Class 70R Wheeled": true, "Class 70R Tracked": true, "Class AA Wheeled": true, "Class AA Tracked": true, "Class SV": true, "Class 70R Bogie": true },
      custom_vehicle_table: {},
      braking_vehicle_checkboxes: { "Class SV": true },
      eccentricity_input: "0.00",
      footpath_mode_combo: "Automatic", footpath_value_input: "5.00",

      // Loading - Seismic
      seismic_zone_combo: "", importance_factor_input: "1.0", soil_type_combo: "Type I \u2013 Rocky or Hard",
      time_period_input: "", damping_input: "2", response_factor_combo: "1",
      dead_load_seismic_combo: "Automatic", dead_load_custom_input: "",
      live_load_seismic_combo: "Automatic", live_load_custom_input: "",

      // Loading - Wind
      basic_wind_speed: "", avg_exposed_height_input: "10", terrain_type_combo: "Plain Terrain", site_topography_combo: "Flat",
      gust_factor_combo: "As per Code", gust_factor_value: "",
      drag_coeff_combo: "As per Code", drag_coeff_value: "",
      drag_coeff_ll_combo: "As per Code", drag_coeff_ll_value: "",
      lift_coeff_combo: "As per Code", lift_coeff_value: "",
      super_area_elev_combo: "Automatic", super_area_elev_value: "",
      super_area_plain_combo: "Automatic", super_area_plain_value: "",
      exposed_frontal_area_combo: "Automatic", exposed_frontal_area_value: "",
      wind_ecc_deck_combo: "As per Code", wind_ecc_deck_value: "",
      wind_ll_ecc_combo: "As per Code", wind_ll_ecc_value: "",

      // Loading - Temperature
      highest_max_temp_input: "", lowest_min_temp_input: "",
      thermal_coeff_steel_input: "12.0e-6", thermal_coeff_rcc_input: "12.0e-6",
      bridge_temp_min_input: "", bridge_temp_max_input: "", temp_rise_input: "", temp_fall_input: "",

      // Loading - Custom & Combinations
      customLoads: [], loadCombinations: {},

      // Support Conditions
      leftSupport: "Pinned", rightSupport: "Roller", bearingLength: "400",

      // Design Options
      construction_stage_combo: "Yes", reinforcement_material_combo: "Fe 500",
      top_clear_cover_input: "50", bottom_clear_cover_input: "40", side_clear_cover_input: "40",
      shear_stud_yield_strength_input: "385.00", shear_stud_ultimate_strength_input: "495.00",
      shear_stud_diameter_combo: "20", shear_stud_height_input: "100.00",
      shear_stud_count_combo: "2", shear_stud_spacing_input: "100.00",

      // Design Options (Cont.)
      gamma_c_basic_input: "1.50", gamma_c_accidental_input: "1.20",
      gamma_m0_input: "1.10", gamma_m1_input: "1.25",
      gamma_s_input: "1.15", gamma_v_input: "1.25",
      gamma_flt_input: "1.00", gamma_mf_input: "1.35",
      load_cycles_input: "2000000.00", limit_input: "600.00",
      ultimate_checkboxes: { "Bending Resistance": true, "Resistance to Vertical Shear": true, "Resistance to Lateral-torsional Buckling": true, "Resistance to Transverse force": true, "Resistance to Longitudinal Shear": true, "Resistance to Fatigue": true },
      service_checkboxes: { "Stress Limitation": true, "Longitudinal Shear (SLS)": true, "Deflection Control": true, "Crack Width Check": true },
    };
    setForm(defaults);

    const defaultMemberProps = createDefaultMemberProperties(
      Number(defaults.noOfGirders),
      Number(bridgeInput?.span_length ?? 35)
    );
    setMemberProps(defaultMemberProps);
  };

  const handleSave = async () => {
    const isOptimized = designMode === "Optimized";
    const errors: string[] = [];

    if (!isOptimized) {
      const stiffenerDetails = memberProps.stiffener_details || {};
      const memberIds = getStiffenerMemberIds();

      for (const mId of memberIds) {
        const stiff = stiffenerDetails[mId] || {};
        
        // 1. Spacing Validation
        if (stiff.intermediate_stiffener === "Yes") {
          const spacing = String(stiff.intermediate_spacing_mm || "").trim();
          const spacingNum = Number(spacing);
          if (!spacing || isNaN(spacingNum) || spacingNum <= 0) {
            errors.push(
              `Intermediate Stiffener Spacing (mm) is required and must be a positive integer for member '${mId}' when Intermediate Stiffener is Yes.`
            );
          }
        }

        // 2. Outstand Validation
        const dims = getMemberSectionDimensions(mId, memberProps);
        if (dims) {
          const { top_flange_width_mm, bottom_flange_width_mm, web_thickness_mm } = dims;
          if (top_flange_width_mm > 0 && bottom_flange_width_mm > 0 && web_thickness_mm > 0) {
            const maxOutstand = (Math.min(top_flange_width_mm, bottom_flange_width_mm) - web_thickness_mm) / 2.0;
            const gId = mId.split("M")[0];
            const segmentsList = memberProps?.girder_details?.[gId]?.segments || [];
            const activeSegIndex = segmentsList.findIndex((s: any) => s.id === mId);
            const isSegExterior = activeSegIndex === 0 || activeSegIndex === segmentsList.length - 1;
            
            if (isSegExterior && stiff.bearing_outstand_mm) {
              const val = Number(stiff.bearing_outstand_mm);
              if (!isNaN(val) && val > maxOutstand) {
                errors.push(
                  `Outstand of Bearing Stiffener (mm) must be between 0 and ${maxOutstand.toFixed(3)} for member '${mId}'.`
                );
              }
            }

            if (stiff.intermediate_stiffener === "Yes" && stiff.intermediate_outstand_mm) {
              const val = Number(stiff.intermediate_outstand_mm);
              if (!isNaN(val) && val > maxOutstand) {
                errors.push(
                  `Outstand of Intermediate Stiffener (mm) must be between 0 and ${maxOutstand.toFixed(3)} for member '${mId}'.`
                );
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      alert("Please fix the validation errors before saving:\n\n" + errors.join("\n"));
      return;
    }

    const updatedData = {
      ...bridgeData,
      girder_spacing:       Number(form.girderSpacing),
      no_of_girders:        Number(form.noOfGirders),
      deck_overhang_width:  Number(form.deckOverhangWidth),
      overall_bridge_width: Number(form.overallBridgeWidth),
      deck_thickness:       Number(form.deckThickness),
      footpath_thickness:   Number(form.footpathThickness),
      footpath_width:       Number(form.footpathWidth),

      crash_barrier_width:  Number(form.crashBarrierWidth),
      crash_barrier_type:   form.crashBarrierType,
      railing_type:         form.railingType,
      railing_width:        Number(form.railingWidth),
      railing_height:       Number(form.railingHeight),
      median_present:       form.medianPresent,
      median_width:         Number(form.medianWidth),
      median_type:          form.medianType,
      wearing_course_thickness: Number(form.wearingCourseThickness),

      member_properties:    serializeMemberProperties(memberProps),

      // Loading fields
      self_weight_factor:   Number(form.self_weight_factor_input ?? 1),
      live_load_vehicles:   form.irc_vehicle_checkboxes ?? {},
      live_load_vehicles_custom: form.custom_vehicle_table ?? {},
      braking_vehicles:     form.braking_vehicle_checkboxes ?? {},
      eccentricity:         Number(form.eccentricity_input ?? 0),
      seismic_zone:         form.seismic_zone_combo,
      importance_factor:    Number(form.importance_factor_input ?? 1),
      soil_type:            form.soil_type_combo,
      time_period:          Number(form.time_period_input ?? 0),
      damping_percentage:   Number(form.damping_input ?? 2),
      response_factor:      Number(form.response_factor_combo ?? 1),
      custom_loads:         form.customLoads ?? [],
      load_combinations:    form.loadCombinations ?? {},

      // Support Conditions
      left_support:         form.leftSupport ?? "Pinned",
      right_support:        form.rightSupport ?? "Roller",
      bearing_length:       Number(form.bearingLength ?? 400),

      // Design Options
      construction_stage:              form.construction_stage_combo ?? "Yes",
      reinforcement_material:          form.reinforcement_material_combo ?? "Fe 500",
      top_clear_cover:                 Number(form.top_clear_cover_input ?? 50),
      bottom_clear_cover:              Number(form.bottom_clear_cover_input ?? 40),
      side_clear_cover:                Number(form.side_clear_cover_input ?? 40),
      shear_stud_yield_strength:       Number(form.shear_stud_yield_strength_input ?? 385),
      shear_stud_ultimate_strength:    Number(form.shear_stud_ultimate_strength_input ?? 495),
      shear_stud_diameter:             Number(form.shear_stud_diameter_combo ?? 20),
      shear_stud_height:               Number(form.shear_stud_height_input ?? 100),
      shear_stud_count:                Number(form.shear_stud_count_combo ?? 2),
      shear_stud_transverse_spacing:   Number(form.shear_stud_spacing_input ?? 100),

      // Partial factors & Limit States
      gamma_c_basic:                   Number(form.gamma_c_basic_input ?? 1.5),
      gamma_c_accidental:              Number(form.gamma_c_accidental_input ?? 1.2),
      gamma_m0:                        Number(form.gamma_m0_input ?? 1.1),
      gamma_m1:                        Number(form.gamma_m1_input ?? 1.25),
      gamma_s:                         Number(form.gamma_s_input ?? 1.15),
      gamma_v:                         Number(form.gamma_v_input ?? 1.25),
      gamma_flt:                       Number(form.gamma_flt_input ?? 1.0),
      gamma_mf:                        Number(form.gamma_mf_input ?? 1.35),
      load_cycles:                     Number(form.load_cycles_input ?? 2000000),
      deflection_limit:                Number(form.limit_input ?? 600),
      ultimate_limit_states:           form.ultimate_checkboxes ?? {},
      serviceability_limit_states:     form.service_checkboxes ?? {},
    };

    try {
      const res = await fetch(`${API}/cross-section/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedData),
      });

      if (res.ok) {
        const newSvgUrl = `${API}/cross-section/svg?t=${Date.now()}`;
        setBridgeData(updatedData);
        setSvgUrl(newSvgUrl);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }

    onClose();
  };

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const renderTabContent = () => {
    if (activeTopTabIndex === 0) {
      switch (activeBottomTabIndex) {
        case 0:
          return <LayoutTab form={form} updateField={updateField} />;
        case 1:
          return <CrashBarrierTab form={form} updateField={updateField} />;
        case 2:
          return <MedianTab form={form} updateField={updateField} />;
        case 3:
          return <RailingTab form={form} updateField={updateField} />;
        case 4:
          return <WearingCourseTab form={form} updateField={updateField} />;
        case 5:
          return <LaneDetailsTab form={form} />;
        default:
          return null;
      }
    }

    if (activeTopTabIndex === 1) {
      switch (activeBottomTabIndex) {
        case 0:
          return (
            <GirderDetailsTab
              memberProps={memberProps}
              setMemberProps={setMemberProps}
              updateGirderField={updateGirderField}
              form={form}
              bridgeInput={bridgeInput}
              rolledProperties={rolledProperties}
              rolledIsSections={rolledIsSections}
            />
          );
        case 1:
          return (
            <StiffenerDetailsTab
              memberProps={memberProps}
              setMemberProps={setMemberProps}
              updateStiffenerField={updateStiffenerField}
              getStiffenerMemberIds={getStiffenerMemberIds}
            />
          );
        case 2:
          return (
            <CrossBracingDetailsTab
              memberProps={memberProps}
              updateBracingField={updateBracingField}
            />
          );
        case 3:
          return (
            <EndDiaphragmDetailsTab
              memberProps={memberProps}
              updateEndDiaphragmField={updateEndDiaphragmField}
              rolledIsSections={rolledIsSections}
              rolledProperties={rolledProperties}
            />
          );
        default:
          return null;
      }
    }

    // Tab 2: Loading
    if (activeTopTabIndex === 2) {
      switch (activeBottomTabIndex) {
        case 0: return <PermanentLoadTab form={form} updateField={updateField} />;
        case 1: return <LiveLoadTab form={form} updateField={updateField} />;
        case 2: return <SeismicLoadTab form={form} updateField={updateField} />;
        case 3: return <WindLoadTab form={form} updateField={updateField} />;
        case 4: return <TemperatureLoadTab form={form} updateField={updateField} />;
        case 5: return <CustomLoadTab form={form} updateField={updateField} />;
        case 6: return <LoadCombinationTab form={form} updateField={updateField} />;
        default: return null;
      }
    }

    // Tab 3: Support Conditions
    if (activeTopTabIndex === 3) {
      return <SupportConditionsTab form={form} updateField={updateField} />;
    }

    // Tab 4: Analysis/Design Options
    if (activeTopTabIndex === 4) {
      return <DesignOptionsTab form={form} updateField={updateField} />;
    }

    // Tab 5: Design Options (Cont.)
    if (activeTopTabIndex === 5) {
      return <DesignOptionsContTab form={form} updateField={updateField} />;
    }

    return (
      <div style={{ padding: 20, textAlign: "center", color: "#555" }}>
        <p style={{ fontWeight: 600, fontSize: 15 }}>{topTabs[activeTopTabIndex]} Configuration</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>This section is configured automatically based on structure type.</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 5000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40, rotateX: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 18, stiffness: 170 }}
            style={{
              width: "84%", height: "90%",
              background: "#efefef", border: "1px solid #8b8b8b",
              display: "flex", flexDirection: "column",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              borderRadius: 4, overflow: "hidden", fontFamily: "sans-serif",
            }}
          >
            {/* HEADER */}
            <div style={{
              height: 54, background: "#ececec",
              borderBottom: "1px solid #9f9f9f",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 18px",
            }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Additional Inputs</div>
              <div style={{ display: "flex", gap: 18, fontSize: 12, alignItems: "center" }}>
                <span style={{ cursor: "pointer" }}>−</span>
                <span style={{ cursor: "pointer" }}>□</span>
                <span onClick={onClose} style={{ cursor: "pointer" }}>×</span>
              </div>
            </div>

            {/* TOP TABS */}
            <div style={{ display: "flex", borderBottom: "1px solid #7a7a7a", background: "#efefef" }}>
              {topTabs.map((tab, i) => (
                <div
                  key={tab}
                  onClick={() => {
                    setActiveTopTabIndex(i);
                    setActiveBottomTabIndex(0);
                  }}
                  style={{
                    padding: "8px 14px", borderRight: "1px solid #7a7a7a",
                    background: i === activeTopTabIndex ? GREEN : "#ececec",
                    color: i === activeTopTabIndex ? "white" : "#555",
                    fontSize: 12, lineHeight: "22px",
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* CAD PREVIEW */}
            {activeTopTabIndex === 0 && (
              <div style={{
                margin: 10, border: "1px solid #555", borderRadius: 10,
                background: "#ffffff", height: 270,
                position: "relative", overflow: "hidden",
              }}>
                {/* Loading overlay */}
                {previewLoading && (
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    background: "rgba(255,255,255,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#666", fontFamily: "sans-serif",
                  }}>
                    Updating preview…
                  </div>
                )}

                {hasDesigned && previewUrl ? (
                  <CrossSectionCanvas svgUrl={previewUrl} />
                ) : (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#777", fontSize: 18, fontWeight: 600, letterSpacing: 1,
                  }}>
                    Cross Section Preview
                  </div>
                )}
              </div>
            )}

            {/* LOWER TABS */}
            {getBottomTabs().length > 0 && (
              <div style={{ display: "flex", margin: "0 14px", border: "1px solid #555" }}>
                {getBottomTabs().map((tab, i) => (
                  <div
                    key={tab}
                    onClick={() => setActiveBottomTabIndex(i)}
                    style={{
                      flex: 1, padding: 8, textAlign: "center",
                      borderRight: i !== getBottomTabs().length - 1 ? "1px solid #555" : "none",
                      background: i === activeBottomTabIndex ? GREEN : "#ececec",
                      color: i === activeBottomTabIndex ? "white" : "#555",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            )}

            {/* FORM */}
            <div style={{
              flex: 1, margin: 14, border: "1px solid #555",
              borderRadius: 12, background: "#f7f7f7", padding: "18px 24px",
              overflowY: "auto",
            }}>
              {renderTabContent()}
            </div>

            {/* FOOTER */}
            <div style={{
              height: 54, background: "#d8d8d8", borderTop: "1px solid #aaa",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 240,
            }}>
              <button onClick={handleDefaults} style={{
                width: 90, height: 30, fontSize: 14,
                background: "#efefef", border: "1px solid #444", cursor: "pointer",
              }}>
                Defaults
              </button>

              <button onClick={handleSave} style={{
                width: 90, height: 30, fontSize: 14,
                background: "#efefef", border: "1px solid #444", cursor: "pointer",
              }}>
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}