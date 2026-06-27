import React, { useState, useEffect } from "react";
import { Label, Input } from "./AdditionalInputs/SharedComponents";

interface MaterialPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (materialName: string, fields: Record<string, string>) => void;
  isDeckMaterial: boolean;
  selectedMaterial: string;
  customFields?: Record<string, string>;
  readOnly?: boolean;
}

const CUSTOM_MATERIAL_PREFIX = "Cus_";
const DEFAULT_DECK_CUSTOM_GRADE = "M 15";

const STEEL_MODULUS_E_GPA = 200.0;
const STEEL_MODULUS_G_GPA = 77.0;
const STEEL_POISSON_RATIO = 0.30;
const STEEL_THERMAL_COEFF = 11.7;

// Deck keys
const KEY_CONCRETE_FCK = "Characteristic Compressive (Cube) Strength of Concrete, fck (MPa)";
const KEY_CONCRETE_FCTM = "Mean Tensile Strength of Concrete, fctm (MPa)";
const KEY_CONCRETE_ECM = "Secant Modulus of Elasticity of Concrete, Ecm (GPa)";
const KEY_THERMAL_EXPANSION = "Thermal Expansion Coefficient, (×10⁻⁶/°C)";

// Steel keys
const KEY_STEEL_FY = "Yield Strength, Fy (MPa)";
const KEY_STEEL_FU = "Ultimate Tensile Strength, Fu (MPa)";
const KEY_STEEL_E = "Modulus of Elasticity, E (GPa)";
const KEY_STEEL_G = "Modulus of Rigidity, G (GPa)";
const KEY_STEEL_POISSON = "Poisson's Ratio, ν";

function normalizeMaterialName(name: string) {
  return (name || "").toUpperCase().replace(/\s+/g, "");
}

function normalizeToken(text: string) {
  const val = (text || "").trim();
  if (!val) return "";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (Number.isInteger(num)) return String(Math.floor(num));
  return String(num);
}

export default function MaterialPropertiesModal({
  isOpen,
  onClose,
  onSave,
  isDeckMaterial,
  selectedMaterial,
  customFields,
  readOnly = false
}: MaterialPropertiesModalProps) {
  const [baseMaterials, setBaseMaterials] = useState<{ steel: Record<string, any>; concrete: Record<string, any> }>({
    steel: {},
    concrete: {}
  });

  const [materialName, setMaterialName] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetch("http://127.0.0.1:8000/api/v1/materials/base-values?t=" + Date.now())
        .then(res => res.json())
        .then(data => {
          setBaseMaterials(data);
          initializeForm(data);
        })
        .catch(err => {
          console.error("Failed to fetch material base values", err);
          initializeForm(baseMaterials);
        });
    }
  }, [isOpen]);

  const initializeForm = (dbData: any) => {
    let initialMaterial = selectedMaterial.trim();
    if (!readOnly && (!initialMaterial || initialMaterial === "Custom")) {
      initialMaterial = CUSTOM_MATERIAL_PREFIX;
    }
    
    setMaterialName(initialMaterial || CUSTOM_MATERIAL_PREFIX);

    if (customFields && Object.keys(customFields).length > 0) {
      setFields({ ...customFields });
      return;
    }

    let defaults: Record<string, string> = {};
    if (isDeckMaterial) {
      let grade = initialMaterial;
      if (!grade || grade.startsWith(CUSTOM_MATERIAL_PREFIX) || !dbData.concrete[normalizeMaterialName(grade)]) {
        grade = DEFAULT_DECK_CUSTOM_GRADE;
      }
      const data = dbData.concrete[normalizeMaterialName(grade)];
      if (data) {
        defaults[KEY_CONCRETE_FCK] = data.fck.toFixed(1);
        defaults[KEY_CONCRETE_FCTM] = data.fctm.toFixed(1);
        defaults[KEY_CONCRETE_ECM] = data.Ecm.toFixed(1);
        defaults[KEY_THERMAL_EXPANSION] = STEEL_THERMAL_COEFF.toFixed(1);
      } else {
        defaults[KEY_CONCRETE_FCK] = "";
        defaults[KEY_CONCRETE_FCTM] = "";
        defaults[KEY_CONCRETE_ECM] = "";
        defaults[KEY_THERMAL_EXPANSION] = STEEL_THERMAL_COEFF.toFixed(1);
      }
    } else {
      let data = dbData.steel[normalizeMaterialName(initialMaterial)];
      if (!data) {
        // Fallback for custom names or generics
        const match = initialMaterial.toUpperCase().replace(/\s+/g, "").match(/E?(250|275|300|350|410|450|550|600|650)/);
        const gradeVal = match ? parseInt(match[1]) : 250;
        const prefix = `E${gradeVal}`;
        const foundKey = Object.keys(dbData.steel).find(k => k.startsWith(prefix));
        if (foundKey) {
          data = dbData.steel[foundKey];
        }
      }

      defaults[KEY_STEEL_FY] = data ? data.Fy.toFixed(1) : "0.0";
      defaults[KEY_STEEL_FU] = data ? data.Fu.toFixed(1) : "0.0";
      defaults[KEY_STEEL_E] = STEEL_MODULUS_E_GPA.toFixed(1);
      defaults[KEY_STEEL_G] = STEEL_MODULUS_G_GPA.toFixed(1);
      defaults[KEY_STEEL_POISSON] = STEEL_POISSON_RATIO.toFixed(1);
      defaults[KEY_THERMAL_EXPANSION] = STEEL_THERMAL_COEFF.toFixed(1);
    }
    setFields(defaults);
  };

  const handleFieldChange = (key: string, value: string) => {
    if (readOnly) return;
    const newFields = { ...fields, [key]: value };
    setFields(newFields);

    // Auto-update custom name
    if (isDeckMaterial) {
      if (key === KEY_CONCRETE_FCK || key === KEY_CONCRETE_FCTM) {
        updateCustomName(newFields[KEY_CONCRETE_FCK], newFields[KEY_CONCRETE_FCTM]);
      }
    } else {
      if (key === KEY_STEEL_FY || key === KEY_STEEL_FU) {
        updateCustomName(newFields[KEY_STEEL_FY], newFields[KEY_STEEL_FU]);
      }
    }
  };

  const updateCustomName = (val1: string, val2: string) => {
    const p1 = normalizeToken(val1);
    const p2 = normalizeToken(val2);
    const parts = [p1, p2].filter(Boolean);
    const newName = parts.length > 0 ? `${CUSTOM_MATERIAL_PREFIX}${parts.join("_")}` : CUSTOM_MATERIAL_PREFIX;
    setMaterialName(newName);
  };

  const handleSave = () => {
    // Validation
    const fieldKeys = isDeckMaterial 
      ? [KEY_CONCRETE_FCK, KEY_CONCRETE_FCTM, KEY_CONCRETE_ECM, KEY_THERMAL_EXPANSION]
      : [KEY_STEEL_FY, KEY_STEEL_FU, KEY_STEEL_E, KEY_STEEL_G, KEY_STEEL_POISSON, KEY_THERMAL_EXPANSION];
    
    for (let key of fieldKeys) {
      if (!fields[key] || !fields[key].trim()) {
        alert(`Please enter a valid value for ${key}`);
        return;
      }
    }
    onSave(materialName || CUSTOM_MATERIAL_PREFIX, fields);
  };

  if (!isOpen) return null;

  const displayFields = isDeckMaterial ? [
    { key: KEY_CONCRETE_FCK, label: <span>Characteristic Compressive (Cube) Strength of Concrete, f<sub>ck</sub> (MPa)</span> },
    { key: KEY_CONCRETE_FCTM, label: <span>Mean Tensile Strength of Concrete, f<sub>ctm</sub> (MPa)</span> },
    { key: KEY_CONCRETE_ECM, label: <span>Secant Modulus of Elasticity of Concrete, E<sub>cm</sub> (GPa)</span> },
    { key: KEY_THERMAL_EXPANSION, label: <span>Thermal Expansion Coefficient, (&times;10<sup>&minus;6</sup>/°C)</span> },
  ] : [
    { key: KEY_STEEL_FY, label: <span>Yield Strength, F<sub>y</sub> (MPa)</span> },
    { key: KEY_STEEL_FU, label: <span>Ultimate Tensile Strength, F<sub>u</sub> (MPa)</span> },
    { key: KEY_STEEL_E, label: <span>Modulus of Elasticity, E (GPa)</span> },
    { key: KEY_STEEL_G, label: <span>Modulus of Rigidity, G (GPa)</span> },
    { key: KEY_STEEL_POISSON, label: <span>Poisson&apos;s Ratio, &nu;</span> },
    { key: KEY_THERMAL_EXPANSION, label: <span>Thermal Expansion Coefficient, (&times;10<sup>&minus;6</sup>/°C)</span> },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #90AF13",
        borderRadius: 8,
        width: 580,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "#ffffff", padding: "10px 16px",
          borderTopLeftRadius: 8, borderTopRightRadius: 8,
          borderBottom: "1px solid #90AF13",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#333", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/Osdag_logo.svg" alt="Osdag" style={{ width: 18, height: 18 }} />
            {readOnly ? "Material Information" : "Enter Custom Properties"}
          </div>
          <button onClick={onClose} style={{
            background: "#8DB600", border: "none", fontSize: 16, fontWeight: "bold",
            cursor: "pointer", color: "#fff", width: 22, height: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 2, paddingBottom: 2
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ width: 280 }}><Label>Material</Label></div>
            <div style={{ width: 242 }}>
              <Input value={materialName} readOnly style={{ backgroundColor: "#f1f1f1" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayFields.map(f => (
              <div key={f.key} style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ width: 280, fontSize: 12, color: "#2d2d2d" }}>
                  {f.label}
                </div>
                <div style={{ width: 242 }}>
                  <Input 
                    value={fields[f.key] || ""} 
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    readOnly={readOnly}
                    type="number"
                    step="0.1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #e0e0e0",
          display: "flex", justifyContent: "flex-end", gap: 10
        }}>
          {readOnly ? (
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#ffffff", color: "#1f1f1f", border: "1px solid #ccc",
                borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
              }}
            >
              OK
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: "#ffffff", color: "#1d1d1d", border: "1px solid #ccc",
                  borderRadius: 6, padding: "8px 14px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#ffffff", color: "#1f1f1f", border: "1px solid #ccc",
                  borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Add
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        button:hover { background-color: #90AF13 !important; color: white !important; }
      `}</style>
    </div>
  );
}
