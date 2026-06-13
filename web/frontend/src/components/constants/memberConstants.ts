export const SAIL_APPROVED_THICKNESS_VALUES = [
  "8", "10", "12", "14", "16", "18", "20", "22", "25", "28", "32", "36", "40", "45", "50", "56", "63"
];

export const ROLLED_IS_SECTIONS = [
  "ISMB 500", "ISMB 550", "ISMB 600", "ISWB 500", "ISWB 550", "ISWB 600"
];

export const STANDARD_ANGLE_SECTIONS = [
  "ISA 5050x6", "ISA 6060x6", "ISA 7575x6", "ISA 8080x8", "ISA 9090x6", "ISA 100100x10", "ISA 110110x10", "ISA 130130x10", "ISA 150150x12", "ISA 200200x16"
];

export const STANDARD_CHANNEL_SECTIONS = [
  "ISMC 100", "ISMC 125", "ISMC 150", "ISMC 175", "ISMC 200", "ISMC 250", "ISMC 300", "ISMC 400"
];

export const GIRDER_DISPLAY_MAP: Record<string, string> = {
  G1: "Girder 1",
  G2: "Girder 2",
  G3: "Girder 3",
  G4: "Girder 4",
  G5: "Girder 5",
  G6: "Girder 6",
  G7: "Girder 7",
  G8: "Girder 8",
  G9: "Girder 9",
  G10: "Girder 10",
  G11: "Girder 11",
  G12: "Girder 12",
  G13: "Girder 13",
  G14: "Girder 14",
  G15: "Girder 15",
  G16: "Girder 16",
  G17: "Girder 17",
  G18: "Girder 18",
  G19: "Girder 19",
  G20: "Girder 20",
};

export const ROLLED_PROPERTIES: Record<string, {
  mass: number;
  area: number;
  depth: number;
  tfw: number;
  tft: number;
  bfw: number;
  bft: number;
  wt: number;
  iz: number;
  iy: number;
  rz: number;
  ry: number;
  zz: number;
  zy: number;
  zpz: number;
  zpy: number;
  it: number;
  iw: number;
}> = {
  "ISMB 500": { mass: 86.9, area: 110.74, depth: 500, tfw: 180, tft: 17.2, bfw: 180, bft: 17.2, wt: 10.2, iz: 45218.3, iy: 1369.8, rz: 20.2, ry: 3.52, zz: 1808.7, zy: 152.2, zpz: 2074.67, zpy: 270.83, it: 98.15, iw: 80240 },
  "ISMB 550": { mass: 103.7, area: 132.11, depth: 550, tfw: 190, tft: 19.3, bfw: 190, bft: 19.3, wt: 11.2, iz: 64893.6, iy: 1833.8, rz: 22.16, ry: 3.73, zz: 2359.8, zy: 193.0, zpz: 2711.98, zpy: 345.54, it: 150.21, iw: 120450 },
  "ISMB 600": { mass: 122.6, area: 156.0, depth: 600, tfw: 210, tft: 20.8, bfw: 210, bft: 20.8, wt: 12.0, iz: 91800.0, iy: 2650.0, rz: 24.26, ry: 4.12, zz: 3060.0, zy: 252.4, zpz: 3510.63, zpy: 451.21, it: 210.45, iw: 180210 },
  "ISWB 500": { mass: 95.2, area: 121.22, depth: 500, tfw: 250, tft: 14.7, bfw: 250, bft: 14.7, wt: 9.9, iz: 52290.9, iy: 2987.8, rz: 20.77, ry: 4.96, zz: 2091.6, zy: 239.0, zpz: 2391.24, zpy: 395.21, it: 110.12, iw: 150450 },
  "ISWB 550": { mass: 112.5, area: 143.34, depth: 550, tfw: 250, tft: 17.6, bfw: 250, bft: 17.6, wt: 10.5, iz: 83288.7, iy: 5794.6, rz: 24.11, ry: 6.35, zz: 3028.7, zy: 463.6, zpz: 3450.21, zpy: 712.54, it: 180.45, iw: 280210 },
  "ISWB 600": { mass: 133.7, area: 170.38, depth: 600, tfw: 250, tft: 21.3, bfw: 250, bft: 21.3, wt: 11.2, iz: 106198.5, iy: 4702.5, rz: 24.96, ry: 5.25, zz: 3540.0, zy: 376.2, zpz: 4110.21, zpy: 610.12, it: 220.34, iw: 350210 },
};
