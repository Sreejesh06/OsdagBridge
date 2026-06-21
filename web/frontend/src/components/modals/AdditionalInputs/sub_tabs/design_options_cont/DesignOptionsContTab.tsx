import React from "react";
import { Label, Input } from "../../SharedComponents";

const ULTIMATE_LIMIT_STATES = [
  "Bending Resistance",
  "Resistance to Vertical Shear",
  "Resistance to Lateral-torsional Buckling",
  "Resistance to Transverse force",
  "Resistance to Longitudinal Shear",
  "Resistance to Fatigue",
];

const SERVICEABILITY_LIMIT_STATES = [
  "Stress Limitation",
  "Longitudinal Shear (SLS)",
  "Deflection Control",
  "Crack Width Check",
];

interface DesignOptionsContTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #ccc", borderRadius: 8,
      background: "#fff", padding: "14px 18px", marginBottom: 14,
    }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 12, color: "#2b2b2b" }}>{title}</div>
      {children}
    </div>
  );
}

function FactorRow({ label, fieldKey, form, updateField, defaultVal = "1.00" }: {
  label: string;
  fieldKey: string;
  form: any;
  updateField: (field: string, value: any) => void;
  defaultVal?: string;
}) {
  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#3a3a3a" }} dangerouslySetInnerHTML={{ __html: label }} />
      <Input
        value={form[fieldKey] ?? defaultVal}
        onChange={e => updateField(fieldKey, e.target.value)}
      />
    </>
  );
}

export default function DesignOptionsContTab({ form, updateField }: DesignOptionsContTabProps) {
  const ultimateStates: Record<string, boolean> = form.ultimateLimitStates ?? {};
  const serviceStates: Record<string, boolean> = form.serviceabilityLimitStates ?? {};

  const toggleUltimate = (name: string, checked: boolean) => {
    updateField("ultimateLimitStates", { ...ultimateStates, [name]: checked });
  };
  const toggleService = (name: string, checked: boolean) => {
    updateField("serviceabilityLimitStates", { ...serviceStates, [name]: checked });
  };

  return (
    <>
      {/* Partial Factors */}
      <SectionCard title="Partial Factor">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 150px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 580,
        }}>
          <FactorRow label="Concrete basic &amp; seismic, &#947;<sub>c</sub>" fieldKey="gammaCBasic" form={form} updateField={updateField} defaultVal="1.50" />
          <FactorRow label="Concrete Accidental, &#947;<sub>c</sub>" fieldKey="gammaCAccidental" form={form} updateField={updateField} defaultVal="1.20" />
          <FactorRow label="Structural steel for Yielding and Buckling, &#947;<sub>M0</sub>" fieldKey="gammaM0" form={form} updateField={updateField} defaultVal="1.10" />
          <FactorRow label="Structural Steel For Ultimate Stress, &#947;<sub>M1</sub>" fieldKey="gammaM1" form={form} updateField={updateField} defaultVal="1.25" />
          <FactorRow label="Reinforcing Steel, &#947;<sub>s</sub>" fieldKey="gammaS" form={form} updateField={updateField} defaultVal="1.15" />
          <FactorRow label="Shear Connectors For Yield, &#947;<sub>v</sub>" fieldKey="gammaV" form={form} updateField={updateField} defaultVal="1.25" />
          <FactorRow label="Fatigue Load, &#947;<sub>flt</sub>" fieldKey="gammaFlt" form={form} updateField={updateField} defaultVal="1.00" />
          <FactorRow label="Fatigue Strength, &#947;<sub>Mf,t</sub>" fieldKey="gammaMf" form={form} updateField={updateField} defaultVal="1.35" />
        </div>
      </SectionCard>

      {/* Resistance to Fatigue */}
      <SectionCard title="Resistance to Fatigue">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 150px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 580,
        }}>
          <Label>Number of Load Cycles:</Label>
          <Input
            value={form.loadCycles ?? "2000000.00"}
            onChange={e => updateField("loadCycles", e.target.value)}
          />
        </div>
      </SectionCard>

      {/* Deflection Control */}
      <SectionCard title="Deflection Control">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 150px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 580,
        }}>
          <Label>Limit:</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>L /</span>
            <input
              type="text"
              value={form.deflectionLimit ?? "600.00"}
              onChange={e => updateField("deflectionLimit", e.target.value)}
              style={{
                flex: 1, height: 28, borderRadius: 5, border: "1px solid #000",
                padding: "0 8px", fontSize: 12, background: "#fff",
                minWidth: 0
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600 }}>m</span>
          </div>
        </div>
      </SectionCard>

      {/* Limit States */}
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#2b2b2b" }}>Limit States:</div>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Ultimate Limit States */}
        <div style={{
          flex: 1, border: "1px solid #333", borderRadius: 8,
          padding: "10px 14px",
        }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: "#2b2b2b" }}>
            Ultimate Limit States
          </div>
          <div style={{ display: "grid", rowGap: 8 }}>
            {ULTIMATE_LIMIT_STATES.map(ls => (
              <label key={ls} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={ultimateStates[ls] ?? true}
                  onChange={e => toggleUltimate(ls, e.target.checked)}
                  style={{ width: 14, height: 14 }}
                />
                <span style={{ fontSize: 12, color: "#333" }}>{ls}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Serviceability Limit States */}
        <div style={{
          flex: 1, border: "1px solid #333", borderRadius: 8,
          padding: "10px 14px",
        }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: "#2b2b2b" }}>
            Serviceability Limit States
          </div>
          <div style={{ display: "grid", rowGap: 8 }}>
            {SERVICEABILITY_LIMIT_STATES.map(ls => (
              <label key={ls} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={serviceStates[ls] ?? true}
                  onChange={e => toggleService(ls, e.target.checked)}
                  style={{ width: 14, height: 14 }}
                />
                <span style={{ fontSize: 12, color: "#333" }}>{ls}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
