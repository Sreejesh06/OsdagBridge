import React from "react";
import { Label, Input, Select, Checkbox } from "./SharedComponents";

interface DynamicSchemaRendererProps {
  fields: any[];
  data: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  disabled?: boolean;
  fieldDisabled?: Record<string, boolean>;
  errors?: Record<string, React.ReactNode>;
  placeholders?: Record<string, string>;
  isOptimizedMode?: boolean;
}

export function DynamicSchemaRenderer({
  fields,
  data,
  onChange,
  disabled = false,
  fieldDisabled = {},
  errors = {},
  placeholders = {},
  isOptimizedMode = false,
}: DynamicSchemaRendererProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "10px 14px", alignItems: "center" }}>
      {fields.map((field: any, fieldIdx: number) => {
        const fieldId = field.bind || field.id;
        let value = data[fieldId];
        if (value === undefined && field.default !== undefined) {
          value = field.default;
        }

        // Hide field if disabled via schema property, global disabled prop, or specific fieldDisabled map
        const isFieldDisabled = disabled || field.read_only === true || field.enabled === false || fieldDisabled[fieldId] === true;
        
        // Handle visible_for (very basic implementation for Girder Details)
        // If the schema requires specific values, hide if condition is not met
        // For example, visible_for: ["welded"] means it should only show if type === "Welded"
        if (field.visible_for && field.visible_for.length > 0) {
           const typeVal = (data["type"] || "Welded").toLowerCase();
           if (!field.visible_for.includes(typeVal)) {
               return null;
           }
        }

        let inputElement: React.ReactNode = null;

        if (field.type === "line" || field.type === "line_with_bounds") {
          if (field.type === "line_with_bounds" && (disabled || isOptimizedMode)) {
            // Optimized mode: Show 'Set Bounds' button ONLY
            inputElement = (
              <button
                type="button"
                onClick={() => onChange(`${fieldId}_bounds_click`, true)}
                style={{
                  padding: "4px 10px",
                  background: "#90AF13",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  width: "max-content"
                }}
              >
                Set Bounds
              </button>
            );
          } else {
            // Custom mode (or standard line): Show Input
            inputElement = (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Input
                  value={value ?? ""}
                  onChange={(e) => onChange(fieldId, e.target.value)}
                  disabled={isFieldDisabled} 
                  readOnly={field.read_only}
                  placeholder={placeholders[fieldId] || ""}
                />
                {errors[fieldId] && (
                  <span style={{ fontSize: 9, color: "#d93838", fontWeight: 500 }}>
                    {errors[fieldId]}
                  </span>
                )}
              </div>
            );
          }
        } else if (field.type === "combo" || field.type === "combo_dynamic") {
          const choices = field.choices || data[`${fieldId}_options`] || [];
          inputElement = (
            <Select
              value={value ?? ""}
              onChange={(e) => onChange(fieldId, e.target.value)}
              options={choices}
              disabled={isFieldDisabled}
            />
          );
        } else if (field.type === "checkbox") {
          inputElement = (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Checkbox
                checked={!!value}
                onChange={(checked) => onChange(fieldId, checked)}
                disabled={isFieldDisabled}
              />
              {field.label && <span style={{ fontSize: 12 }}>{field.label}</span>}
            </div>
          );
        } else if (field.type === "mode_line" || field.type === "mode_value") {
           const textValue = data[fieldId] ?? "";
           const modeId = field.bind_mode || `${fieldId}_mode`;
           const modeValue = data[modeId] ?? (field.mode_choices?.[0] || "All");
           
           if (disabled || isOptimizedMode) {
             // Optimized mode: Show the mode selection (All / Custom)
             inputElement = (
               <Select
                  value={modeValue}
                  onChange={(e) => onChange(modeId, e.target.value)}
                  options={field.mode_choices || ["All", "Custom"]}
                  disabled={field.read_only === true || fieldDisabled[modeId] === true}
               />
             );
           } else {
             // Custom mode: Show the actual value input or dropdown
             if (field.type === "mode_value") {
               const valueChoices = data.thickness_values_mm || ["8", "10", "12", "14", "16", "18", "20", "22", "25", "28", "32", "36", "40", "45", "50", "56", "63", "75", "80", "90", "100", "110", "120"];
               inputElement = (
                  <Select
                    value={textValue}
                    onChange={(e) => onChange(fieldId, e.target.value)}
                    options={valueChoices}
                  />
               );
             } else {
               inputElement = (
                  <Input
                    value={textValue}
                    onChange={(e) => onChange(fieldId, e.target.value)}
                    readOnly={field.read_only}
                  />
               );
             }
           }
        } else {
          // Fallback
          inputElement = (
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(fieldId, e.target.value)}
              disabled={isFieldDisabled}
            />
          );
        }

        if (field.type === "checkbox" && !field.label) {
           // Skip rendering separate label if it's already rendered above
           return (
             <div key={field.id || fieldIdx} style={{ gridColumn: "span 2" }}>
                {inputElement}
             </div>
           );
        }

        return (
          <React.Fragment key={field.id || fieldIdx}>
            <Label>
              <span dangerouslySetInnerHTML={{ __html: field.label }} />
            </Label>
            {inputElement}
          </React.Fragment>
        );
      })}
    </div>
  );
}
