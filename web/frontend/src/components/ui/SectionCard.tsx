import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, children }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      border: "1px solid #d0d7de",
      borderRadius: "6px",
      marginBottom: "12px",
      overflow: "hidden"
    }}>
      
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: "#e8f5e9",
          padding: "8px 10px",
          fontWeight: "600",
          cursor: "pointer"
        }}
      >
        {title} {open ? "−" : "+"}
      </div>

      {open && (
        <div style={{ padding: "10px" }}>
          {children}
        </div>
      )}
    </div>
  );
}