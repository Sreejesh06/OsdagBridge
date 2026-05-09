import { useState } from "react";


type Props = {
  onOpenAdditionalInputs: () => void;
};

export default function LeftPanel({
  onOpenAdditionalInputs,
}: Props) {
  const [tab, setTab] = useState<"basic" | "additional">("basic");

  const green = "#8DB600";
  const border = "#9dbb2e";

  return (
    <div
      style={{
        width: "300px",
        background: "#f4f4f4",
        borderRight: `2px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "calc(100vh - 35px)",
      }}
    >
      {/* TOP SPACE */}
      <div style={{ padding: "6px" }} />

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "0 10px 10px",
        }}
      >
        <button
          onClick={() => setTab("basic")}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "10px",
            border: "none",
            background: tab === "basic" ? green : "#e0e0e0",
            color: tab === "basic" ? "#fff" : "#000",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Basic Inputs
        </button>

        <button
          onClick={onOpenAdditionalInputs}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "10px",
            border: "none",
            background: "#e0e0e0",
            color: "#000",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Additional Inputs
        </button>
      </div>

      {/* SCROLL AREA */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        <Section title="Type of Structure">
          <Row label="Type of Structure">
            <select className="input">
              <option>Highway Bridge</option>
            </select>
          </Row>
        </Section>

        <Section>
          <Row label="Project Location *">
            <button className="greenBtn">Add Here</button>
          </Row>
        </Section>

        <Section title="Superstructure">

  {/* GEOMETRIC DETAILS */}
  <InnerSection title="Geometric Details">

    <Row label="Span*">
      <input className="input" placeholder="20.0-45.0 m" />
    </Row>

    <Row label="Carriageway Width*">
      <input className="input" placeholder="4.25 - 23.6 m" />
    </Row>

    <Row label="Include Median">
      <select className="input">
        <option>No</option>
      </select>
    </Row>

    <Row label="Footpath">
      <select className="input">
        <option>None</option>
      </select>
    </Row>

    <Row label="Skew Angle">
      <input className="input" placeholder="-15.0 - 15.0°" />
    </Row>

    <Row label="Additional Geometry">
      <button className="greenBtn">
        Modify Here
      </button>
    </Row>

  </InnerSection>

  {/* MATERIAL INPUTS */}
  <InnerSection title="Material Inputs">

    <Row label="Girder">
      <select className="input">
        <option>E 250A</option>
      </select>
    </Row>

    <Row label="Cross Bracing">
      <select className="input">
        <option>E 250A</option>
      </select>
    </Row>

    <Row label="End Diaphragm">
      <select className="input">
        <option>E 250A</option>
      </select>
    </Row>

    <Row label="Deck">
      <select className="input">
        <option>M 25</option>
      </select>
    </Row>

    <Row label="Properties">
      <button className="greenBtn">
        Modify Here
      </button>
    </Row>

  </InnerSection>

</Section>

        </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px",
          background: "#efefef",
          borderTop: "1px solid #cfcfcf",
          flexShrink: 0,
        }}
      >
        <button
          className="greenBtn"
          style={{
            flex: 1,
            height: "40px",
            color: "white",
            fontSize: "15px",
            borderRadius: "14px",
          }}
        >
          💾 Save Input
        </button>

        <button
          className="greenBtn"
          style={{
            flex: 1,
            height: "40px",
            color: "white",
            fontSize: "15px",
            borderRadius: "14px",
          }}
        >
          🛠 Design
        </button>
      </div>

      <style>
        {`
          .input {
            width: 100%;
            padding: 7px;
            border-radius: 8px;
            border: 1px solid #aaa;
            background: #eeeeee;
          }

          .greenBtn {
            background: #8DB600;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children }: any) {
  return (
    <div
      style={{
        border: "2px solid #8DB600",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "14px",
        background: "#ffffff",
        position: "relative",
      }}
    >
      {title && (
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "12px",
            background: "#fff",
            padding: "0 6px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {title}
        </div>
      )}

      <div style={{ marginTop: title ? "6px" : 0 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        marginBottom: "10px",
        gap: "10px",
      }}
    >
      <div style={{ fontSize: "13px" }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

{/* ---------- COMPONENTS ---------- */}
function InnerSection({ title, children }: any) {
  return (
    <div
      style={{
        border: "1.5px solid #8DB600",
        borderRadius: "6px",
        padding: "14px 10px 10px",
        marginTop: "16px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-9px",
          left: "10px",
          background: "#fff",
          padding: "0 6px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {title}
      </div>

      {children}
    </div>
  );
}

function SubTitle({ children }: any) {
  return (
    <div
      style={{
        fontWeight: "600",
        marginBottom: "8px",
      }}
    >
      {children}
    </div>
  );
}