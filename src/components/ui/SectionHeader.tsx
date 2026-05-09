export default function SectionHeader({ title }: { title: string }) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <span style={{ fontWeight: 600 }}>{title}</span>
  
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            border: "2px solid black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
          }}
        >
          -
        </div>
      </div>
    );
  }