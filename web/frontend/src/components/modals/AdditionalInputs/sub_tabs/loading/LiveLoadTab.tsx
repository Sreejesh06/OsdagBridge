import React, { useState } from "react";
import { Label, Select, Input, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox, Checkbox } from "../../SharedComponents";
import LiveLoadCustomVehicleModal from "./LiveLoadCustomVehicleModal";

const IRC_VEHICLES = [
  "Class A",
  "Class 70R Wheeled",
  "Class 70R Tracked",
  "Class AA Wheeled",
  "Class AA Tracked",
  "Class SV",
  "Class 70R Bogie",
];

interface LiveLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LiveLoadTab({ form, updateField }: LiveLoadTabProps) {
  const selectedVehicles: Record<string, boolean> = form.liveLoadVehicles ?? {};
  const customVehicles: Record<string, any> = form.customVehicles ?? {};
  const brakingVehicles: Record<string, boolean> = form.brakingVehicles ?? { "Class SV": true };
  const footpathMode = form.footpathMode ?? "Automatic";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleName, setEditingVehicleName] = useState<string | null>(null);

  const toggleVehicle = (name: string, checked: boolean) => {
    updateField("liveLoadVehicles", { ...selectedVehicles, [name]: checked });
  };

  const toggleBraking = (name: string, checked: boolean) => {
    updateField("brakingVehicles", { ...brakingVehicles, [name]: checked });
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
    updateField("customVehicles", newCustomVehicles);

    // Auto-add to braking list
    const newBraking = { ...brakingVehicles, [vehicle.name]: true };
    updateField("brakingVehicles", newBraking);

    setIsModalOpen(false);
  };

  const handleDeleteCustomVehicle = (name: string) => {
    if (!window.confirm(`Delete custom vehicle '${name}'?`)) return;
    const newCustomVehicles = { ...customVehicles };
    delete newCustomVehicles[name];
    updateField("customVehicles", newCustomVehicles);

    const newBraking = { ...brakingVehicles };
    delete newBraking[name];
    updateField("brakingVehicles", newBraking);
  };

  const customVehicleKeys = Object.keys(customVehicles);

  // Braking list dynamically computed: Class SV + custom vehicles
  const dynamicBrakingList = ["Class SV", ...customVehicleKeys];

  return (
    <TwoColumnLayout>
      <LeftColumn>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#3a3a3a", padding: "0 4px" }}>
          Live Load (LL) Inputs
        </div>

        <SectionBox>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a", marginBottom: 12 }}>
            Vehicles from IRC 6
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 12, maxWidth: 380, marginLeft: 8 }}>
            {IRC_VEHICLES.map(v => (
              <React.Fragment key={v}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#333", alignSelf: "center" }}>{v}</div>
                <Checkbox
                  checked={selectedVehicles[v] ?? true}
                  onChange={checked => toggleVehicle(v, checked)}
                />
              </React.Fragment>
            ))}
          </div>
        </SectionBox>

        <SectionBox>
          {customVehicleKeys.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a" }}>
                Custom Vehicle
              </div>
              <button onClick={handleAddCustomVehicleClick} style={btnStyle}>Add</button>
            </div>
          )}

          {customVehicleKeys.length === 0 ? (
            <>

              <button onClick={handleAddCustomVehicleClick} style={{ ...btnStyle, alignSelf: "flex-start" }}>
                Add Custom Vehicle
              </button>
            </>
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

        <SectionBox>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a", marginBottom: 12 }}>
            Braking Load from Vehicles
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 12, maxWidth: 380, marginLeft: 8 }}>
            {dynamicBrakingList.map(v => (
              <React.Fragment key={`brake_${v}`}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#333", alignSelf: "center" }}>{v}</div>
                <Checkbox
                  checked={brakingVehicles[v] ?? true}
                  onChange={checked => toggleBraking(v, checked)}
                />
              </React.Fragment>
            ))}
          </div>
        </SectionBox>

        <SectionBox>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 256px",
            rowGap: 14, columnGap: 16, alignItems: "center",
          }}>
            <Label>Eccentricity from top of Deck (m)</Label>
            <Input
              value={form.eccentricity ?? "0.00"}
              onChange={e => updateField("eccentricity", e.target.value)}
            />
          </div>
        </SectionBox>

        <SectionBox>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 140px 100px",
            rowGap: 10, columnGap: 16, alignItems: "center",
          }}>
            <Label>Footpath Pressure (kN/mm²)</Label>
            <Select
              value={footpathMode}
              onChange={e => updateField("footpathMode", e.target.value)}
              options={["Automatic", "User-defined"]}
            />
            <input
              type="text"
              value={footpathMode === "Automatic" ? "" : (form.footpathPressure ?? "")}
              onChange={e => updateField("footpathPressure", e.target.value)}
              disabled={footpathMode !== "User-defined"}
              style={{
                height: 28, borderRadius: 5, border: "1px solid #000",
                padding: "0 6px", fontSize: 12,
                background: footpathMode !== "User-defined" ? "#f1f1f1" : "#fff",
                color: footpathMode !== "User-defined" ? "#888" : "#000",
                boxSizing: "border-box"
              }}
            />
          </div>
        </SectionBox>
      </LeftColumn>

      <DescriptionBox>
        {`211.2 The braking effect on a simply supported span or a continuous unit of spans or on any other type of bridge unit shall be assumed to have the following value:\n\n` +
          `a) In the case of a single lane or a two lane bridge: twenty percent of the first train load plus ten percent of the load of the succeeding trains or part thereof, the train loads in one lane only being considered for the purpose of this subclause. Where the entire first train is not on the full span, the braking force shall be taken as equal to twenty percent of the loads actually on the span or continuous unit of spans.\n` +
          `b) In the case of bridges having more than two lanes: as in (a) above for the first two lanes plus five percent of the loads on the lanes in excess of two.`}
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
