import React, { useState, useEffect } from "react";
import { Label, Select, Input, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox, Checkbox } from "../../SharedComponents";
import LiveLoadCustomVehicleModal from "./LiveLoadCustomVehicleModal";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface LiveLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LiveLoadTab({ form, updateField }: LiveLoadTabProps) {
  const [schema, setSchema] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleName, setEditingVehicleName] = useState<string | null>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("live_load_tab").then((data) => setSchema(data));
    });
  }, []);

  const selectedVehicles: Record<string, boolean> = form.irc_vehicle_checkboxes ?? {};
  const customVehicles: Record<string, any> = form.custom_vehicle_table ?? {};
  const brakingVehicles: Record<string, boolean> = form.braking_vehicle_checkboxes ?? { "Class SV": true };

  const toggleVehicle = (name: string, checked: boolean) => {
    updateField("irc_vehicle_checkboxes", { ...selectedVehicles, [name]: checked });
  };

  const toggleBraking = (name: string, checked: boolean) => {
    updateField("braking_vehicle_checkboxes", { ...brakingVehicles, [name]: checked });
  };

  const handleAddCustomVehicleClick = () => {
    setEditingVehicleName(null);
    setIsModalOpen(true);
  };

  const handleEditCustomVehicleClick = (name: string) => {
    setEditingVehicleName(name);
    setIsModalOpen(true);
  };

  const handleSaveCustomVehicle = (vehicle: any) => {
    const newCustomVehicles = { ...customVehicles };
    if (editingVehicleName && editingVehicleName !== vehicle.name) {
      delete newCustomVehicles[editingVehicleName];
    }
    newCustomVehicles[vehicle.name] = vehicle;
    updateField("custom_vehicle_table", newCustomVehicles);

    // Auto-add to braking list
    const newBraking = { ...brakingVehicles, [vehicle.name]: true };
    updateField("braking_vehicle_checkboxes", newBraking);

    setIsModalOpen(false);
  };

  const handleDeleteCustomVehicle = (name: string) => {
    if (!window.confirm(`Delete custom vehicle '${name}'?`)) return;
    const newCustomVehicles = { ...customVehicles };
    delete newCustomVehicles[name];
    updateField("custom_vehicle_table", newCustomVehicles);

    const newBraking = { ...brakingVehicles };
    delete newBraking[name];
    updateField("braking_vehicle_checkboxes", newBraking);
  };

  const customVehicleKeys = Object.keys(customVehicles);
  const dynamicBrakingList = ["Class SV", ...customVehicleKeys];

  return (
    <TwoColumnLayout>
      <LeftColumn>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#3a3a3a", padding: "0 4px" }}>
          Live Load (LL) Inputs
        </div>

        {schema?.sections?.map((section: any, idx: number) => {
          if (section.type === "checkbox_list") {
            return (
              <SectionBox key={idx}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a", marginBottom: 12 }}>
                  {section.title}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 12, maxWidth: 380, marginLeft: 8 }}>
                  {(section.items || []).map((v: string) => (
                    <React.Fragment key={v}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#333", alignSelf: "center" }}>{v}</div>
                      <Checkbox
                        checked={selectedVehicles[v] ?? section.default_checked ?? true}
                        onChange={checked => toggleVehicle(v, checked)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </SectionBox>
            );
          } else if (section.type === "custom_vehicle_table") {
            return (
              <SectionBox key={idx}>
                {customVehicleKeys.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a" }}>
                      {section.title}
                    </div>
                    <button onClick={handleAddCustomVehicleClick} style={btnStyle}>Add</button>
                  </div>
                )}
                {customVehicleKeys.length === 0 ? (
                  <button onClick={handleAddCustomVehicleClick} style={{ ...btnStyle, alignSelf: "flex-start" }}>
                    Add Custom Vehicle
                  </button>
                ) : (
                  <div style={{ border: "1px solid #eee", borderRadius: 4, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" }}>
                      <tbody>
                        {customVehicleKeys.map(name => (
                          <tr key={name} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "6px 8px", fontWeight: 600 }}>{name}</td>
                            <td style={{ padding: "6px 8px", width: 30 }}>
                              <Checkbox checked={true} onChange={() => { }} disabled />
                            </td>
                            <td style={{ padding: "6px 8px", width: 50 }}>
                              <button onClick={() => handleEditCustomVehicleClick(name)} style={smallBtnStyle}>Edit</button>
                            </td>
                            <td style={{ padding: "6px 8px", width: 50 }}>
                              <button onClick={() => handleDeleteCustomVehicle(name)} style={smallBtnStyle}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionBox>
            );
          } else if (section.type === "dynamic_checkbox_list") {
            return (
              <SectionBox key={idx}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a", marginBottom: 12 }}>
                  {section.title}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 12, maxWidth: 380, marginLeft: 8 }}>
                  {dynamicBrakingList.map(v => (
                    <React.Fragment key={`brake_${v}`}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#333", alignSelf: "center" }}>{v}</div>
                      <Checkbox
                        checked={brakingVehicles[v] ?? section.default_checked ?? true}
                        onChange={checked => toggleBraking(v, checked)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </SectionBox>
            );
          } else {
            // Treat as a standard field
            return (
              <SectionBox key={idx}>
                <DynamicSchemaRenderer
                  fields={section.fields || [section]}
                  data={form}
                  onChange={updateField}
                />
              </SectionBox>
            );
          }
        })}
      </LeftColumn>

      <DescriptionBox>
        {schema?.description?.text || ""}
      </DescriptionBox>

      {isModalOpen && (
        <LiveLoadCustomVehicleModal
          onSave={handleSaveCustomVehicle}
          onCancel={() => setIsModalOpen(false)}
          initialData={editingVehicleName ? customVehicles[editingVehicleName] : undefined}
        />
      )}
    </TwoColumnLayout>
  );
}

const btnStyle = {
  padding: "4px 12px", border: "1px solid #3a3a3a", borderRadius: 3,
  background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#3a3a3a"
};

const smallBtnStyle = {
  padding: "2px 6px", border: "1px solid #3a3a3a", borderRadius: 3,
  background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#3a3a3a"
};
