type Props = {
    label: string;
    placeholder?: string;
  };
  
  export default function InputField({ label, placeholder }: Props) {
    return (
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px" }}>{label}</label>
        <input
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>
    );
  }