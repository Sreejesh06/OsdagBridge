import React from "react";
import { GIRDER_DISPLAY_MAP } from "../../constants/memberConstants";

export function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "#2f2f2f", background: "transparent" }}>{children}</div>;
}

export function Input({
  value,
  onChange,
  disabled = false,
  placeholder = "",
  readOnly = false,
}: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{
        width: "100%", height: 28,
        borderRadius: 6, border: "1px solid #070707",
        background: disabled ? "#f1f1f1" : readOnly ? "#f6f6f6" : "#ffffff",
        padding: "0 8px", fontSize: 12,
        color: disabled ? "#666" : readOnly ? "#555" : "#000",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%", height: 28,
        borderRadius: 5, border: "1px solid #000000",
        background: disabled ? "#f1f1f1" : "#ffffff",
        padding: "0 4px", fontSize: 12,
        color: disabled ? "#666" : "#000",
        outline: "none",
        boxSizing: "border-box",
      }}
    >
      {options.map(o => (
        <option key={o} value={o}>{GIRDER_DISPLAY_MAP[o] || o}</option>
      ))}
    </select>
  );
}
