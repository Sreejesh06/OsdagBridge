import React from "react";
import { Label, Input } from "../../SharedComponents";

import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

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
  const [schema, setSchema] = React.useState<any>(null);

  React.useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("design_options_cont_tab").then((data) => setSchema(data));
    });
  }, []);

  const ultimateStates: Record<string, boolean> = form.ultimate_checkboxes ?? {};
  const serviceStates: Record<string, boolean> = form.service_checkboxes ?? {};

  const toggleUltimate = (name: string, checked: boolean) => {
    updateField("ultimate_checkboxes", { ...ultimateStates, [name]: checked });
  };
  const toggleService = (name: string, checked: boolean) => {
    updateField("service_checkboxes", { ...serviceStates, [name]: checked });
  };

  return (
    <>
      {schema?.sections?.map((section: any, idx: number) => {
        // Special case for checkbox groups (Limit States)
        if (section.checkbox_groups) {
          return (
            <React.Fragment key={idx}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#2b2b2b" }}>{section.title}:</div>
              <div style={{ display: "flex", gap: 20 }}>
                {section.checkbox_groups.map((group: any, gIdx: number) => {
                  const stateMap = group.bind === "ultimate_checkboxes" ? ultimateStates : serviceStates;
                  const toggleFn = group.bind === "ultimate_checkboxes" ? toggleUltimate : toggleService;

                  return (
                    <div key={gIdx} style={{
                      flex: 1, border: "1px solid #333", borderRadius: 8,
                      padding: "10px 14px",
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: "#2b2b2b" }}>
                        {group.title}
                      </div>
                      <div style={{ display: "grid", rowGap: 8 }}>
                        {(group.items || []).map((ls: string) => (
                          <label key={ls} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={stateMap[ls] ?? group.default_checked ?? true}
                              onChange={e => toggleFn(ls, e.target.checked)}
                              style={{ width: 14, height: 14 }}
                            />
                            <span style={{ fontSize: 12, color: "#333" }}>{ls}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        }

        // Standard card section
        return (
          <SectionCard key={idx} title={section.title}>
            <DynamicSchemaRenderer
              fields={section.fields || []}
              data={form}
              onChange={updateField}
            />
          </SectionCard>
        );
      })}
    </>
  );
}
