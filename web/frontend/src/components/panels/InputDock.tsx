import { useState, useEffect } from "react";
import { useBridgeStore } from "../../store/bridgeStore";
import { analyzeBridge } from "../../services/api";
import ProjectLocationDialog from "../ProjectLocationDialog/ProjectLocationDialog";
import MaterialPropertiesModal from "../modals/MaterialPropertiesModal";

type Props = {
  onOpenAdditionalInputs: () => void;
};

export default function LeftPanel({
  onOpenAdditionalInputs,
}: Props) {
  const [tab, setTab] = useState<"basic" | "additional">("basic");
  const [isSuperstructureOpen, setIsSuperstructureOpen] = useState(true);
  const [showLocationDialog, setShowLocationDialog] =
  useState(false);
  const {
    bridgeInput,
    updateBridgeInput,
    bridgeData,
    setBridgeData,
    setAnalysisResult,
    setHasDesigned,
    setSvgUrl,
    designMode,
    setDesignMode,
  } = useBridgeStore();

  const [baseMaterials, setBaseMaterials] = useState<{ steel: string[], concrete: string[] }>({ steel: [], concrete: [] });
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [modalMember, setModalMember] = useState("");
  const [modalIsDeck, setModalIsDeck] = useState(false);
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/materials/base-values?t=" + Date.now())
      .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(data => {
        setBaseMaterials({
          steel: Object.keys(data.steel || {}),
          concrete: Object.keys(data.concrete || {})
        });
      })
      .catch(err => setFetchError(err.toString()));
  }, []);

  const handleMaterialChange = (field: string, value: string, isDeck: boolean) => {
    if (value === "Custom") {
      setModalMember(field);
      setModalIsDeck(isDeck);
      setModalReadOnly(false);
      setShowMaterialModal(true);
    } else {
      setBridgeData({ ...bridgeData, [field]: value });
    }
  };

  const handleInfoClick = (field: string, isDeck: boolean) => {
    setModalMember(field);
    setModalIsDeck(isDeck);
    setModalReadOnly(true);
    setShowMaterialModal(true);
  };
  
  const green = "#8DB600";

  return (
    <div
      style={{
        width: "300px",
        background: "#ffffff", 
        borderRight: "1px solid #ccc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        height: "calc(100vh - 35px)",
      }}
    >
      {/* TABS HEADER */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 10px 10px",
          alignItems: "center",
          borderBottom: "1px solid #ddd"
        }}
      >
        <button
          onClick={() => setTab("basic")}
          style={{
            flex: 1.5,
            padding: "8px 0",
            borderRadius: "4px",
            border: tab === "basic" ? "1px solid #8DB600" : "1px solid #333",
            background: tab === "basic" ? green : "#fff",
            color: tab === "basic" ? "#fff" : "#000",
            fontWeight: "600",
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          Basic Inputs
        </button>

        <button
          onClick={onOpenAdditionalInputs}
          style={{
            flex: 1.7,
            padding: "8px 0",
            borderRadius: "4px",
            border: tab === "additional" ? "1px solid #8DB600" : "1px solid #333",
            background: tab === "additional" ? green : "#fff",
            color: tab === "additional" ? "#fff" : "#000",
            fontWeight: "600",
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          Additional Inputs
        </button>
        
        {/* Lock Icon */}
        <button
          style={{
            width: "32px",
            height: "34px",
            background: "#f4f4f4",
            border: "1px solid #ccc",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </button>
      </div>

      {/* SCROLL AREA */}
      <div
        className="custom-scrollbar"
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          minHeight: 0,
        }}
      >

        <InnerSection title="Type of Structure">
          <Row label="Structure Type">
            <select className="material-select">
              <option>Highway Bridge</option>
            </select>
          </Row>
        </InnerSection>

        <ActionBox 
          label="Project Location*" 
          actionContent={
            <button
              className="greenBtn"
              style={{ width: "100%", borderRadius: '4px', padding: '7px' }}
              onClick={(e) => { e.stopPropagation(); setShowLocationDialog(true); }}
            >
              Select Location
            </button>
          }
        />

        <div style={{
          border: '1.5px solid #8DB600',
          borderRadius: '4px',
          padding: '10px',
          marginTop: '14px',
          background: '#fff'
        }}>
          <div 
            style={{ padding: '0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isSuperstructureOpen ? '10px' : '0' }}
            onClick={() => setIsSuperstructureOpen(!isSuperstructureOpen)}
          >
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#333' }}>Superstructure</div>
            <div style={{ border: '1.5px solid #000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                <path d={isSuperstructureOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
              </svg>
            </div>
          </div>

          {isSuperstructureOpen && (
            <>
        {/* GEOMETRIC DETAILS */}
        <InnerSection title="Geometric Details">
          <Row label="Span (m)*">
            <input
              className="input"
              value={bridgeInput.span_length}
              onChange={(e) => updateBridgeInput("span_length", Number(e.target.value))}
            />
          </Row>

          <Row label="Carriageway Width* (Each way) (m)">
            <input
              className="input"
              value={bridgeInput.width}
              onChange={(e) => updateBridgeInput("width", Number(e.target.value))}
            />
          </Row>

          <Row label="Include Median">
            <select className="material-select">
              <option>No</option>
            </select>
          </Row>

          <Row label="Footpath">
            <select className="material-select">
              <option>None</option>
            </select>
          </Row>

          <Row label="Skew Angle (deg)">
            <input
              className="input"
              value={bridgeInput.skew_angle}
              onChange={(e) => updateBridgeInput("skew_angle", Number(e.target.value))}
            />
          </Row>
        </InnerSection>

        <InnerSection>
          <Row label="Additional Geometry">
            <button 
              className="greenBtn" 
              style={{ width: '100%', borderRadius: '4px', padding: '7px' }}
              onClick={onOpenAdditionalInputs}
            >
              Modify Here
            </button>
          </Row>
        </InnerSection>

        <InnerSection>
          <Row label="Design Type">
            <select
              className="material-select"
              value={designMode}
              onChange={(e) => setDesignMode(e.target.value as "Optimized" | "Custom")}
            >
              <option value="Optimized">Optimized</option>
              <option value="Custom">Custom</option>
            </select>
          </Row>
        </InnerSection>

        {/* MATERIAL INPUTS */}
        <InnerSection title="Material Inputs">
          {fetchError && <div style={{ color: "red", fontSize: 10 }}>Error: {fetchError}</div>}

          <Row label="Girder">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              <select 
                className="material-select" 
                value={(bridgeData?.girder_material as string) || "E250A"} 
                onChange={e => handleMaterialChange("girder_material", e.target.value, false)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {baseMaterials.steel.map(m => <option key={m} value={m}>{m}</option>)}
                {(bridgeData?.girder_material as string)?.startsWith("Cus_") && (
                   <option value={bridgeData?.girder_material as string}>{bridgeData?.girder_material as string}</option>
                )}
                <option value="Custom">Custom...</option>
              </select>
              <div 
                title="View material properties"
                onClick={() => handleInfoClick("girder_material", false)}
                style={{ border: '1.5px solid #8DB600', color: '#8DB600', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '11px', fontWeight: 'bold', fontFamily: 'serif', fontStyle: 'italic', paddingBottom: '1px' }}
              >
                i
              </div>
            </div>
          </Row>

          <Row label="Cross Bracing">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              <select 
                className="material-select" 
                value={(bridgeData?.cross_bracing_material as string) || "E250A"}
                onChange={e => handleMaterialChange("cross_bracing_material", e.target.value, false)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {baseMaterials.steel.map(m => <option key={m} value={m}>{m}</option>)}
                {(bridgeData?.cross_bracing_material as string)?.startsWith("Cus_") && (
                   <option value={bridgeData?.cross_bracing_material as string}>{bridgeData?.cross_bracing_material as string}</option>
                )}
                <option value="Custom">Custom...</option>
              </select>
              <div 
                title="View material properties"
                onClick={() => handleInfoClick("cross_bracing_material", false)}
                style={{ border: '1.5px solid #8DB600', color: '#8DB600', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '11px', fontWeight: 'bold', fontFamily: 'serif', fontStyle: 'italic', paddingBottom: '1px' }}
              >
                i
              </div>
            </div>
          </Row>

          <Row label="End Diaphragm">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              <select 
                className="material-select" 
                value={(bridgeData?.end_diaphragm_material as string) || "E250A"}
                onChange={e => handleMaterialChange("end_diaphragm_material", e.target.value, false)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {baseMaterials.steel.map(m => <option key={m} value={m}>{m}</option>)}
                {(bridgeData?.end_diaphragm_material as string)?.startsWith("Cus_") && (
                   <option value={bridgeData?.end_diaphragm_material as string}>{bridgeData?.end_diaphragm_material as string}</option>
                )}
                <option value="Custom">Custom...</option>
              </select>
              <div 
                title="View material properties"
                onClick={() => handleInfoClick("end_diaphragm_material", false)}
                style={{ border: '1.5px solid #8DB600', color: '#8DB600', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '11px', fontWeight: 'bold', fontFamily: 'serif', fontStyle: 'italic', paddingBottom: '1px' }}
              >
                i
              </div>
            </div>
          </Row>

          <Row label="Deck">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              <select 
                className="material-select" 
                value={(bridgeData?.deck_material as string) || "M25"}
                onChange={e => handleMaterialChange("deck_material", e.target.value, true)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {baseMaterials.concrete.map(m => <option key={m} value={m}>{m}</option>)}
                {(bridgeData?.deck_material as string)?.startsWith("Cus_") && (
                   <option value={bridgeData?.deck_material as string}>{bridgeData?.deck_material as string}</option>
                )}
                <option value="Custom">Custom...</option>
              </select>
              <div 
                title="View material properties"
                onClick={() => handleInfoClick("deck_material", true)}
                style={{ border: '1.5px solid #8DB600', color: '#8DB600', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '11px', fontWeight: 'bold', fontFamily: 'serif', fontStyle: 'italic', paddingBottom: '1px' }}
              >
                i
              </div>
            </div>
          </Row>

        </InnerSection>
            </>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "12px",
          background: "#fff",
          borderTop: "1px solid #ccc",
          flexShrink: 0,
        }}
      >
        <button
          className="greenBtn"
          style={{
            flex: 1,
            height: "40px",
            color: "white",
            fontSize: "14px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          Save Input
        </button>

        <button
          className="greenBtn"
          style={{
            flex: 1,
            height: "40px",
            color: "white",
            fontSize: "14px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onClick={async () => {
            try {
              if (!bridgeInput.cross_section_initialized) {
                const defaultCrossSectionPayload = {
                  ...bridgeInput,
                  girder_spacing: bridgeInput.girder_spacing ?? 4,
                  no_of_girders: bridgeInput.no_of_girders ?? 4,
                  deck_overhang_width: bridgeInput.deck_overhang_width ?? 1,
                  overall_bridge_width: bridgeInput.overall_bridge_width ?? bridgeInput.width ?? 12,
                  deck_thickness: bridgeInput.deck_thickness ?? 250,
                  footpath_thickness: bridgeInput.footpath_thickness ?? 150,
                  footpath_width: bridgeInput.footpath_width ?? 1.5,
                  cross_section_initialized: true,
                };
                await fetch("http://127.0.0.1:8000/cross-section/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(defaultCrossSectionPayload),
                });
                updateBridgeInput("cross_section_initialized", true);
              }
          
              await fetch("http://127.0.0.1:8000/top-view/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bridgeInput),
              });
          
              const result = await analyzeBridge(bridgeInput);
              setAnalysisResult(result);
              setSvgUrl(`http://127.0.0.1:8000/cross-section/svg?t=${Date.now()}`);
              setHasDesigned(true);
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Design
        </button>
      </div>

      <style>
        {`
          .input {
            width: 100%;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #000;
            background: #fff;
            color: #000;
            font-size: 13.5px;
            font-weight: 500;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            box-sizing: border-box;
          }

          .material-select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 100%;
            padding: 4px 26px 4px 8px;
            border-radius: 4px;
            border: 1px solid #000;
            background-color: #fff;
            color: #000;
            font-size: 13.5px;
            font-weight: 500;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            background-image: url('data:image/svg+xml;utf8,<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="black" stroke-width="1.5"/><path d="M7 10L12 15L17 10" fill="black"/></svg>');
            background-repeat: no-repeat;
            background-position: right 6px center;
            cursor: pointer;
            box-sizing: border-box;
          }

          .greenBtn {
            background: #8DB600;
            border: none;
            padding: 8px;
            border-radius: 4px;
            font-weight: 600;
            color: #fff;
            cursor: pointer;
          }
            
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1; 
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1; 
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8; 
          }
        `}
      </style>

      {showLocationDialog && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/20">
          <ProjectLocationDialog onClose={() => setShowLocationDialog(false)} />
        </div>
      )}

      <MaterialPropertiesModal 
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        isDeckMaterial={modalIsDeck}
        readOnly={modalReadOnly}
        selectedMaterial={(bridgeData?.[modalMember] as string) || (modalIsDeck ? "M25" : "E250A")}
        customFields={(bridgeData?.custom_materials as any)?.[bridgeData?.[modalMember] as string]}
        onSave={(name, fields) => {
          const customMaterials = { ...(bridgeData?.custom_materials as any || {}) };
          customMaterials[name] = fields;
          const updates: any = { custom_materials: customMaterials, [modalMember]: name };
          if (!modalIsDeck && modalMember === "girder_material") {
            updates["cross_bracing_material"] = name;
            updates["end_diaphragm_material"] = name;
          }
          setBridgeData({ ...bridgeData, ...updates });
          setShowMaterialModal(false);
        }}
      />
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Row({ label, children }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1.3fr",
        alignItems: "center",
        marginBottom: "10px",
        gap: "6px",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: "normal", color: "#000" }}>{label}</div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function ActionBox({ label, actionContent, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1.5px solid #8DB600",
        borderRadius: "4px",
        padding: "8px 10px",
        marginTop: "14px",
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "1.1fr 1.3fr",
        alignItems: "center",
        gap: "6px",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#000" }}>{label}</div>
      <div style={{ minWidth: 0, display: "flex", justifyContent: "flex-end" }}>{actionContent}</div>
    </div>
  );
}

function InnerSection({ title, children }: any) {
  return (
    <fieldset
      style={{
        border: "1.5px solid #8DB600",
        borderRadius: "4px",
        padding: "12px 10px 4px",
        marginTop: "16px",
        position: "relative",
        background: "#fff"
      }}
    >
      {title && (
        <legend
          style={{
            background: "#fff",
            padding: "0 4px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#000",
            marginLeft: "6px"
          }}
        >
          {title}
        </legend>
      )}

      {children}
    </fieldset>
  );
}