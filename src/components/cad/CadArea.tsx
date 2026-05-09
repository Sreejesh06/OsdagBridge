

const ctrlBtn = {
  width: "28px",
  height: "28px",
  borderRadius: "4px",
  border: "1px solid #aaa",
  background: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const resetBtn = {
  width: "50px",
  height: "28px",
  borderRadius: "4px",
  border: "1px solid #aaa",
  background: "#fff",
  cursor: "pointer",
  fontSize: "12px",
};

const zoomIn = () => {
  console.log("Zoom In");
};

const zoomOut = () => {
  console.log("Zoom Out");
};

const resetView = () => {
  console.log("Reset View");
};

export default function CadArea() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        background: "#efefef",
      }}
    >
      {/* 🔹 TOP CAD */}
      <div
        style={{
          flex: 1,
          background: "#f3f3f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "3px solid #cfcfcf",
          position: "relative",
          overflow: "hidden",
        }}
      >
        CAD VIEW TOP



        {/* 🔹 RIGHT SIDE CONTROLS */}
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: "60px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <button onClick={zoomIn} style={ctrlBtn}>+</button>
          <button onClick={zoomOut} style={ctrlBtn}>−</button>
          <button onClick={resetView} style={resetBtn}>Reset</button>
        </div>
      </div>

      {/* 🔹 CENTER RESIZER */}
      <div
        style={{
          height: "6px",
          background: "#cfcfcf",
          cursor: "row-resize",
          borderTop: "1px solid #bbb",
          borderBottom: "1px solid #bbb",
        }}
      />

      {/* 🔹 BOTTOM CAD */}
      <div
        style={{
          flex: 1,
          background: "#f3f3f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        CAD VIEW BOTTOM

        {/* 🔹 RIGHT CONTROLS */}
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <button style={ctrlBtn}>+</button>
          <button style={ctrlBtn}>−</button>
          <button style={resetBtn}>Reset</button>
        </div>

        {/* 🔹 RIGHT VERTICAL TEXT */}
        <div
          style={{
            position: "absolute",
            right: "0px",
            top: "50%",
            transform: "translateY(-50%) rotate(90deg)",
            fontWeight: "600",
            letterSpacing: "6px",
            color: "#222",
          }}
        >
        </div>
      </div>
    </div>
  );
}