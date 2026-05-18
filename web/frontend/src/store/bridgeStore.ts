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

type BridgeStore = {
  bridgeInput: BridgeInput;

  hoveredElement: string | null;

  setHoveredElement: (
    element: string | null
  ) => void;

  analysisResult: AnalysisResult | null;

  hasDesigned: boolean;

  svgUrl: string;

  updateBridgeInput: (
    key: keyof BridgeInput,
    value: number
  ) => void;

  setAnalysisResult: (
    result: AnalysisResult
  ) => void;

  setHasDesigned: (
    value: boolean
  ) => void;

  setSvgUrl: (
    url: string
  ) => void;
};

export const useBridgeStore =
  create<BridgeStore>((set) => ({
    bridgeInput: {
      span_length: 35,
      width: 12,
      num_girders: 4,
      skew_angle: 0,
    },

    hoveredElement: null,

    analysisResult: null,

    hasDesigned: false,

    svgUrl: "",

    updateBridgeInput: (key, value) =>
      set((state) => ({
        bridgeInput: {
          ...state.bridgeInput,
          [key]: value,
        },
      })),

    setHoveredElement: (element) =>
      set({
        hoveredElement: element,
      }),

    setAnalysisResult: (result) =>
      set({
        analysisResult: result,
      }),

    setHasDesigned: (value) =>
      set({
        hasDesigned: value,
      }),

    setSvgUrl: (url) =>
      set({
        svgUrl: url,
      }),
  }));