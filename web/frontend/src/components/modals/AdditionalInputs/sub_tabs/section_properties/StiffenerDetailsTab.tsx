import React, { useState } from "react";
import { Label, Input, Select } from "../../SharedComponents";
import { SAIL_APPROVED_THICKNESS_VALUES } from "../../../../constants/memberConstants";

interface StiffenerDetailsTabProps {
  memberProps: any;
  updateStiffenerField: (memberId: string, field: string, value: any) => void;
  getStiffenerMemberIds: () => string[];
}

export default function StiffenerDetailsTab({
  memberProps,
  updateStiffenerField,
  getStiffenerMemberIds,
}: StiffenerDetailsTabProps) {
  const [selectedStiffenerMember, setSelectedStiffenerMember] = useState<string>("G1M1");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {/* Left: Inputs */}
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 12 }}>Stiffener Inputs</span>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.25fr", rowGap: 10, columnGap: 14, alignItems: "center" }}>
          <Label>Select Member ID:</Label>
          <Select
            value={selectedStiffenerMember}
            onChange={e => setSelectedStiffenerMember(e.target.value)}
            options={getStiffenerMemberIds()}
          />

          {(() => {
            const stiff = memberProps.stiffener_details?.[selectedStiffenerMember] || {};
            return (
              <>
                <Label>No. of Bearing Stiffeners (one side):</Label>
                <Select
                  value={stiff.bearing_stiffeners_each_end || "2"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "bearing_stiffeners_each_end", e.target.value)}
                  options={["1", "2", "3", "4"]}
                />

                <Label>Bearing Stiffener Spacing (mm):</Label>
                <Input
                  value={stiff.bearing_spacing_mm || "100"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "bearing_spacing_mm", e.target.value)}
                />

                <Label>Bearing Stiffener Thickness (mm):</Label>
                <div style={{ display: "flex", gap: 6 }}>
                  <Select
                    value={stiff.bearing_thickness || "All"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "bearing_thickness", e.target.value)}
                    options={["All", "Custom"]}
                  />
                  <Select
                    value={stiff.bearing_thickness_value || "16"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "bearing_thickness_value", e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                  />
                </div>

                <Label>Outstand of Bearing Stiffener (mm):</Label>
                <Input
                  value={stiff.bearing_outstand_mm || "150"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "bearing_outstand_mm", e.target.value)}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                <Label>Intermediate Stiffener:</Label>
                <Select
                  value={stiff.intermediate_stiffener || "No"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "intermediate_stiffener", e.target.value)}
                  options={["No", "Yes"]}
                />

                <Label>Intermediate Stiffener Spacing (mm):</Label>
                <Input
                  value={stiff.intermediate_spacing_mm || "1000"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "intermediate_spacing_mm", e.target.value)}
                  disabled={stiff.intermediate_stiffener !== "Yes"}
                />

                <Label>Intermediate Stiffener Thickness (mm):</Label>
                <div style={{ display: "flex", gap: 6 }}>
                  <Select
                    value={stiff.intermediate_thickness || "All"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "intermediate_thickness", e.target.value)}
                    options={["All", "Custom"]}
                    disabled={stiff.intermediate_stiffener !== "Yes"}
                  />
                  <Select
                    value={stiff.intermediate_thickness_value || "12"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "intermediate_thickness_value", e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                    disabled={stiff.intermediate_stiffener !== "Yes"}
                  />
                </div>

                <Label>Outstand of Intermediate Stiffener (mm):</Label>
                <Input
                  value={stiff.intermediate_outstand_mm || "100"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "intermediate_outstand_mm", e.target.value)}
                  disabled={stiff.intermediate_stiffener !== "Yes"}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                <Label>Longitudinal Stiffener:</Label>
                <Select
                  value={stiff.longitudinal_stiffener || "No"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "longitudinal_stiffener", e.target.value)}
                  options={["No", "Yes and 1 stiffener", "Yes and 2 stiffeners"]}
                />

                <Label>Longitudinal Stiffener Thickness (mm):</Label>
                <div style={{ display: "flex", gap: 6 }}>
                  <Select
                    value={stiff.longitudinal_thickness || "All"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "longitudinal_thickness", e.target.value)}
                    options={["All", "Custom"]}
                    disabled={stiff.longitudinal_stiffener === "No"}
                  />
                  <Select
                    value={stiff.longitudinal_thickness_value || "12"}
                    onChange={e => updateStiffenerField(selectedStiffenerMember, "longitudinal_thickness_value", e.target.value)}
                    options={SAIL_APPROVED_THICKNESS_VALUES}
                    disabled={stiff.longitudinal_stiffener === "No"}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Right: Buckling Methods & Drawing */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 12 }}>Web Buckling Design Method</span>

          {(() => {
            const stiff = memberProps.stiffener_details?.[selectedStiffenerMember] || {};
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.25fr", gap: 14, alignItems: "center" }}>
                <Label>Shear Buckling Design Method:</Label>
                <Select
                  value={stiff.shear_buckling_method || "Simple Post Critical"}
                  onChange={e => updateStiffenerField(selectedStiffenerMember, "shear_buckling_method", e.target.value)}
                  options={["Simple Post Critical", "Tension Field"]}
                />
              </div>
            );
          })()}
        </div>

        {/* Stiffened Web Drawing */}
        <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 8 }}>Web Plate Layout Diagram</span>
          <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 6, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
            <svg width="220" height="150">
              {/* Web plate outline */}
              <rect x="20" y="25" width="180" height="90" fill="#e0e0e0" stroke="#555" strokeWidth="1.5" />
              {/* Top Flange */}
              <rect x="15" y="15" width="190" height="10" fill="#bbb" stroke="#555" />
              {/* Bottom Flange */}
              <rect x="15" y="115" width="190" height="10" fill="#bbb" stroke="#555" />

              {/* Bearing Stiffeners (Ends) */}
              <line x1="25" y1="15" x2="25" y2="125" stroke="#444" strokeWidth="4" />
              <line x1="195" y1="15" x2="195" y2="125" stroke="#444" strokeWidth="4" />

              {/* Intermediate Stiffeners (if enabled) */}
              {memberProps.stiffener_details?.[selectedStiffenerMember]?.intermediate_stiffener === "Yes" && (
                <>
                  <line x1="75" y1="25" x2="75" y2="115" stroke="#95b80f" strokeWidth="2.5" />
                  <line x1="135" y1="25" x2="135" y2="115" stroke="#95b80f" strokeWidth="2.5" />
                  <text x="105" y="75" fontSize="9" textAnchor="middle" fill="#557a02">Intermediate</text>
                </>
              )}

              {/* Longitudinal Stiffeners (if enabled) */}
              {memberProps.stiffener_details?.[selectedStiffenerMember]?.longitudinal_stiffener !== "No" && (
                <line x1="20" y1="55" x2="200" y2="55" stroke="#0072b2" strokeWidth="2" strokeDasharray="3,2" />
              )}
              {memberProps.stiffener_details?.[selectedStiffenerMember]?.longitudinal_stiffener === "Yes and 2 stiffeners" && (
                <line x1="20" y1="85" x2="200" y2="85" stroke="#0072b2" strokeWidth="2" strokeDasharray="3,2" />
              )}

              <text x="110" y="140" fontSize="10" textAnchor="middle" fill="#666">Stiffener Layout side-profile</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
