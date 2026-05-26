import { create } from "zustand";

type BridgeInput = {
  span_length: number;
  width: number;
  num_girders: number;
  skew_angle: number;
};

type AnalysisResult = {
  maxMoment: number;
  maxShear: number;
  maxDisplacement: number;
  status: string;
};

// BridgeData covers all additional inputs persisted across modal open/close
type BridgeData = {
  girder_spacing?:       number;
  no_of_girders?:        number;
  deck_overhang_width?:  number;
  overall_bridge_width?: number;
  deck_thickness?:       number;
  footpath_thickness?:   number;
  footpath_width?:       number;
  [key: string]: unknown; // allow extra fields from backend
};

type BridgeStore = {
  bridgeInput:  BridgeInput;
  bridgeData:   BridgeData | null;
  analysisResult: AnalysisResult | null;
  hasDesigned:  boolean;
  svgUrl:       string;
  hoveredElement: string | null;

  updateBridgeInput:  (key: keyof BridgeInput, value: number) => void;
  setBridgeData:      (data: BridgeData) => void;
  setAnalysisResult:  (result: AnalysisResult) => void;
  setHasDesigned:     (value: boolean) => void;
  setSvgUrl:          (url: string) => void;
  setHoveredElement:  (element: string | null) => void;
};

export const useBridgeStore = create<BridgeStore>((set) => ({
  bridgeInput: {
    span_length: 35,
    width:       12,
    num_girders: 4,
    skew_angle:  0,
  },

  bridgeData: {
    girder_spacing:       4,
    no_of_girders:        4,
    deck_overhang_width:  1,
    overall_bridge_width: 12,
    deck_thickness:       250,
    footpath_thickness:   150,
    footpath_width:       1.5,
  },

  analysisResult:  null,
  hasDesigned:     false,
  svgUrl:          "",
  hoveredElement:  null,

  updateBridgeInput: (key, value) =>
    set((state) => ({
      bridgeInput: { ...state.bridgeInput, [key]: value },
    })),

  setBridgeData: (data) => set({ bridgeData: data }),

  setAnalysisResult: (result) => set({ analysisResult: result }),

  setHasDesigned: (value) => set({ hasDesigned: value }),

  // Updating svgUrl causes CrossSectionCanvas on the dashboard to re-fetch
  setSvgUrl: (url) => set({ svgUrl: url }),

  setHoveredElement: (element) => set({ hoveredElement: element }),
}));