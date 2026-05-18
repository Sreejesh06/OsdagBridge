export interface BridgeInput {
    structureType: string;
    span: number;
    carriagewayWidth: number;
    includeMedian: boolean;
    skewAngle: number;
    girderMaterial: string;
    deckMaterial: string;
  }
  
  export interface BridgeAnalysisResult {
    maxMoment: number;
    maxShear: number;
    maxDisplacement: number;
  }