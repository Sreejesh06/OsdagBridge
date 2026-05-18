import { useState } from "react";
import { useBridgeStore } from "../../store/bridgeStore";

export default function RightPanel() {
  const green = "#8cab1a";
  const border = "#9dbb2e";
  const { analysisResult } = useBridgeStore();
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [designOpen, setDesignOpen] = useState(true);
  const [superOpen, setSuperOpen] = useState(true);
  const [subOpen, setSubOpen] = useState(false);

  return (
    <div
      style={{
        width: "300px",
        background: "#f4f4f4",
        borderLeft: `2px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: green,
          padding: "12px",
          textAlign: "center",
          color: "#fff",
          fontWeight: "600",
          borderRadius: "12px",
          margin: "10px",
        }}
      >
        Output Dock
      </div>

      {/* CONTENT */}
      <div style={{ padding: "10px", overflowY: "auto" }}>
        {/* ANALYSIS */}
        <Section
          title="Analysis Results"
          open={analysisOpen}
          toggle={() => setAnalysisOpen(!analysisOpen)}
        >
          <Row label="Member ID:">
            <select className="input">
              <option>All</option>
            </select>
          </Row>

          <Row label="Load Combination:">
            <select className="input">
              <option>Envelope</option>
            </select>
          </Row>

          {/* FORCE CHECKBOXES */}
          <CheckGrid
            items={["Vx", "Vy", "Vz", "Tx", "My", "Mz", "Dx", "Dy", "Dz"]}
          />

          <div style={{ marginTop: "10px", fontSize: "13px" }}>
            Display Options:
          </div>

          <CheckGrid items={["Max", "Min"]} />

          <CheckRow label="Controlling Utilization Ratio" />
          {analysisResult && (
  <div
    style={{
      marginTop: "20px",
      fontSize: "13px",
      borderTop: "1px solid #ccc",
      paddingTop: "10px",
    }}
  >
    <div>
      Max Moment:
      {" "}
      {analysisResult.maxMoment}
    </div>

    <div>
      Max Shear:
      {" "}
      {analysisResult.maxShear}
    </div>

    <div>
      Max Displacement:
      {" "}
      {analysisResult.maxDisplacement}
    </div>
  </div>
)}
        </Section>

        {/* DESIGN */}
        <Section
          title="Design"
          open={designOpen}
          toggle={() => setDesignOpen(!designOpen)}
        >
          {/* SUPERSTRUCTURE */}
          <SubSection
            title="Superstructure"
            open={superOpen}
            toggle={() => setSuperOpen(!superOpen)}
          >
            <button className="pillBtn">Steel Design</button>
            <button className="pillBtn">Deck Design</button>
          </SubSection>

          {/* SUBSTRUCTURE */}
          <SubSection
            title="Substructure"
            open={subOpen}
            toggle={() => setSubOpen(!subOpen)}
          ></SubSection>
        </Section>
      </div>

      {/* FOOTER BUTTONS */}
      <div style={{ padding: "12px" }}>
        <button className="bigBtn">Generate Results Table</button>
        <button className="bigBtn">Generate Report</button>
      </div>

      {/* STYLES */}
      <style>
        {`
          .input {
            width: 100%;
            padding: 6px;
            border-radius: 10px;
            border: 1px solid #aaa;
            background: #f0f0f0;
          }

          .pillBtn {
            width: 100%;
            padding: 10px;
            border-radius: 12px;
            border: 1px solid #888;
            background: #eaeaea;
            margin-bottom: 10px;
            font-weight: 500;
          }

          .bigBtn {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: none;
            background: ${green};
            color: white;
            font-weight: 600;
            margin-bottom: 10px;
          }
        `}
      </style>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children, open, toggle }: any) {
  return (
    <div
      style={{
        border: "2px solid #9dbb2e",
        borderRadius: "12px",
        marginBottom: "12px",
        background: "#fff",
      }}
    >
      <div
        onClick={toggle}
        style={{
          padding: "8px 10px",
          fontWeight: "600",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </div>

      {open && <div style={{ padding: "10px" }}>{children}</div>}
    </div>
  );
}

function SubSection({ title, children, open, toggle }: any) {
  return (
    <div
      style={{
        border: "2px solid #9dbb2e",
        borderRadius: "10px",
        marginBottom: "10px",
        padding: "10px",
      }}
    >
      <div
        onClick={toggle}
        style={{
          fontWeight: "600",
          marginBottom: "10px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </div>

      {open && children}
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "13px", marginBottom: "4px" }}>{label}</div>
      {children}
    </div>
  );
}

function CheckGrid({ items }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginTop: "10px",
      }}
    >
      {items.map((item: string) => {
        const isForce =
          ["Vx", "Vy", "Vz", "Tx", "My", "Mz", "Dx", "Dy", "Dz"].includes(item);

        // FORCE ITEMS → RADIO BUTTONS
        if (isForce) {
          const main = item.charAt(0);
          const sub = item.charAt(1);

          return (
            <label
              key={item}
              style={{
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <input type="radio" name="forceType" />

              <span>
                {main}
                <sub
                  style={{
                    fontSize: "10px",
                  }}
                >
                  {sub}
                </sub>
              </span>
            </label>
          );
        }

        // NORMAL ITEMS → CHECKBOXES
        return (
          <label
            key={item}
            style={{
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input type="checkbox" />
            {item}
          </label>
        );
      })}
    </div>
  );
}
function CheckRow({ label }: any) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "12px",
        fontSize: "13px",
      }}
    >
      <input type="checkbox" />
      {label}
    </label>
  );
}