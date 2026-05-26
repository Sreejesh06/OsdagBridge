import { useState } from "react";
import { useBridgeStore } from "../../store/bridgeStore";
import { analyzeBridge } from "../../services/api";
import ProjectLocationDialog
from "../ProjectLocationDialog/ProjectLocationDialog";

type Props = {
  onOpenAdditionalInputs: () => void;
};

export default function LeftPanel({
  onOpenAdditionalInputs,
}: Props) {
  const [tab, setTab] = useState<"basic" | "additional">("basic");
  const [showLocationDialog, setShowLocationDialog] =
  useState(false);
  const {
    bridgeInput,
    updateBridgeInput,
    setAnalysisResult,
    setHasDesigned,
    setSvgUrl,
  } = useBridgeStore();
  

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
  <button
    className="greenBtn"
    onClick={() => setShowLocationDialog(true)}
  >
    Select Location
  </button>
</Row>
        </Section>

        <Section title="Superstructure">

  {/* GEOMETRIC DETAILS */}
  <InnerSection title="Geometric Details">

    <Row label="Span*">
    <input
  className="input"
  value={bridgeInput.span_length}
  onChange={(e) =>
    updateBridgeInput(
      "span_length",
      Number(e.target.value)
    )
  }
/>
    </Row>

    <Row label="Carriageway Width*">
    <input
  className="input"
  value={bridgeInput.width}
  onChange={(e) =>
    updateBridgeInput(
      "width",
      Number(e.target.value)
    )
  }
/>
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
  <input
    className="input"
    value={bridgeInput.skew_angle}
    onChange={(e) =>
      updateBridgeInput(
        "skew_angle",
        Number(e.target.value)
      )
    }
  />
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
  onClick={async () => {
    try {
  
      // CROSS SECTION
      // Generate default cross section ONLY ON FIRST DESIGN

if (!bridgeInput.cross_section_initialized) {

  const defaultCrossSectionPayload = {
    ...bridgeInput,

    girder_spacing:
      bridgeInput.girder_spacing ?? 4,

    no_of_girders:
      bridgeInput.no_of_girders ?? 4,

    deck_overhang_width:
      bridgeInput.deck_overhang_width ?? 1,

    overall_bridge_width:
      bridgeInput.overall_bridge_width
      ?? bridgeInput.width
      ?? 12,

    deck_thickness:
      bridgeInput.deck_thickness ?? 250,

    footpath_thickness:
      bridgeInput.footpath_thickness ?? 150,

    footpath_width:
      bridgeInput.footpath_width ?? 1.5,

    cross_section_initialized: true,
  };

  await fetch(
    "http://127.0.0.1:8000/cross-section/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        defaultCrossSectionPayload
      ),
    }
  );

  updateBridgeInput(
    "cross_section_initialized",
    true
  );
}
  
      // TOP VIEW
      await fetch(
        "http://127.0.0.1:8000/top-view/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bridgeInput),
        }
      );
  
      // ANALYSIS
      const result = await analyzeBridge(
        bridgeInput
      );
  
      setAnalysisResult(result);
  
      // UPDATE CAD
      setSvgUrl(
        `http://127.0.0.1:8000/cross-section/svg?t=${Date.now()}`
      );
  
      setHasDesigned(true);
  
    } catch (err) {
      console.error(err);
    }
  }}
>
  Design
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

      {showLocationDialog && (
  <div
    className="
      fixed
      inset-0
      z-[999999]
      flex
      items-center
      justify-center
      bg-black/20
    "
  >
    <ProjectLocationDialog
      onClose={() =>
        setShowLocationDialog(false)
      }
    />
  </div>
)}
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