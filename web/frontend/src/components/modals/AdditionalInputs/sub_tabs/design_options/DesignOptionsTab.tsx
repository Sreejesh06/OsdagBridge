import React, { useState } from "react";
import { Label, Input, Select, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

const ALL_REINFORCEMENT_SIZES = [8, 10, 12, 16, 20, 25, 28, 32, 36, 40];

interface DesignOptionsTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

interface BoundsDialogProps {
  current: { lower: number; upper: number };
  onSave: (bounds: { lower: number; upper: number }) => void;
  onCancel: () => void;
}

function ReinforcementBoundsDialog({ current, onSave, onCancel }: BoundsDialogProps) {
  const [lower, setLower] = useState(String(current.lower));
  const [upper, setUpper] = useState(String(current.upper));
  const [error, setError] = useState("");

  const handleSave = () => {
    const lo = parseFloat(lower);
    const hi = parseFloat(upper);
    const errs: string[] = [];
    if (isNaN(lo) || isNaN(hi)) errs.push("Please enter valid numeric values.");
    else {
      if (lo < 8) errs.push("Lower bound cannot be less than 8 mm.");
      if (hi > 40) errs.push("Upper bound cannot be greater than 40 mm.");
      if (hi <= lo) errs.push("Upper bound must be greater than lower bound.");
    }
    if (errs.length) { setError(errs.join("\n")); return; }
    onSave({ lower: lo, upper: hi });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#f4f4f4", width: 440, borderRadius: 2,
        border: "1px solid #8ab81e",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 16px", borderBottom: "1px solid #8ab81e",
          fontWeight: 700, fontSize: 12, display: "flex", justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/Osdag_logo.svg" alt="Osdag Logo" style={{ width: 16, height: 16 }} />
            <span>Reinforcement Size</span>
          </div>
          <span style={{ cursor: "pointer", color: "#000", fontWeight: "bold", fontSize: 16 }} onClick={onCancel}>×</span>
        </div>
        <div style={{ padding: "30px 24px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 20, columnGap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#2b2b2b" }}>Lower Bound:</div>
            <input 
              value={lower} 
              onChange={e => setLower(e.target.value)} 
              style={{ borderRadius: 6, border: "1px solid #ccc", height: 32, padding: "0 10px", fontSize: 13, width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 13, color: "#2b2b2b" }}>Upper Bound:</div>
            <input 
              value={upper} 
              onChange={e => setUpper(e.target.value)} 
              style={{ borderRadius: 6, border: "1px solid #ccc", height: 32, padding: "0 10px", fontSize: 13, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          {error && <div style={{ color: "red", fontSize: 11, marginTop: 12, whiteSpace: "pre-line" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "10px 24px 24px" }}>
          <button onClick={onCancel} style={bottomBtnStyle}>Cancel</button>
          <button onClick={handleSave} style={bottomBtnStyle}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default function DesignOptionsTab({ form, updateField }: DesignOptionsTabProps) {
  const [schema, setSchema] = useState<any>(null);
  const [showBoundsDialog, setShowBoundsDialog] = useState(false);

  React.useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("design_options_tab").then((data) => setSchema(data));
    });
  }, []);

  // Intercept the bounds button click from DynamicSchemaRenderer
  const handleFieldChange = (fieldId: string, value: any) => {
    if (fieldId === "reinforcement_bounds_btn_click") {
      setShowBoundsDialog(true);
      return;
    }
    updateField(fieldId, value);
  };

  const bounds: { lower: number; upper: number } = form.reinforcementBounds ?? { lower: 8, upper: 40 };

  const handleBoundsSave = (newBounds: { lower: number; upper: number }) => {
    updateField("reinforcementBounds", newBounds);
    setShowBoundsDialog(false);
  };

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {schema?.cards?.map((card: any, idx: number) => (
          <SectionBox title={card.title} key={idx}>
            {card.sections?.map((section: any, sIdx: number) => (
              <DynamicSchemaRenderer
                key={sIdx}
                fields={section.fields}
                data={form}
                onChange={handleFieldChange}
              />
            ))}
          </SectionBox>
        ))}
      </LeftColumn>

      <DescriptionBox>
        {"\n"}
      </DescriptionBox>

      {showBoundsDialog && (
        <ReinforcementBoundsDialog
          current={bounds}
          onSave={handleBoundsSave}
          onCancel={() => setShowBoundsDialog(false)}
        />
      )}
    </TwoColumnLayout>
  );
}

const setBoundsBtn: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  background: "#ffffff",
  border: "1px solid #a0a0a0",
  borderRadius: 4,
  color: "#2a2a2a",
  height: 28,
  width: "100%",
};

const bottomBtnStyle: React.CSSProperties = {
  padding: "6px 26px",
  border: "1px solid #000",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: "#000",
};
