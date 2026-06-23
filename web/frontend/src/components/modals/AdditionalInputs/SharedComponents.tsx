import React from "react";
import { GIRDER_DISPLAY_MAP } from "../../constants/memberConstants";

export function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 400, color: "#2f2f2f", background: "transparent" }}>{children}</div>;
}

export function Checkbox({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 16, height: 16, border: "2px solid #8cc63f", borderRadius: 3,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        background: "#fff",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#8cc63f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

export function Input({
  value,
  onChange,
  disabled = false,
  placeholder = "",
  readOnly = false,
  style,
}: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
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
        borderRadius: 4, border: "1px solid #a0a0a0",
        background: disabled ? "#f1f1f1" : readOnly ? "#f6f6f6" : "#ffffff",
        padding: "0 8px", fontSize: 12,
        color: disabled ? "#666" : readOnly ? "#555" : "#000",
        outline: "none",
        ...style,
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%", height: 28,
        borderRadius: 4, border: "1px solid #a0a0a0",
        background: disabled ? "#f1f1f1" : "#ffffff",
        padding: "0 4px", fontSize: 12,
        color: disabled ? "#666" : "#000",
        outline: "none",
        ...style,
      }}
    >
      {options.map(o => (
        <option key={o} value={o}>{GIRDER_DISPLAY_MAP[o] || o}</option>
      ))}
    </select>
  );
}

export function TwoColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "3fr 2fr",
      gap: 16,
      alignItems: "start",
      height: "100%"
    }}>
      {children}
    </div>
  );
}

export function LeftColumn({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #b2b2b2",
      borderRadius: 10,
      backgroundColor: "#ffffff",
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      {children}
    </div>
  );
}

export function DescriptionBox({ title = "Description Box", children }: { title?: string, children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #9c9c9c",
      borderRadius: 10,
      backgroundColor: "#d4d4d4",
      padding: 16,
      minHeight: 420,
      minWidth: 260,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#000", textAlign: "center" }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: "#4b4b4b", whiteSpace: "pre-wrap" }}>
        {children}
      </div>
    </div>
  );
}

export function SectionBox({ title, children }: { title?: string, children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #9c9c9c",
      borderRadius: 6,
      backgroundColor: "#ffffff",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3a3a" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
