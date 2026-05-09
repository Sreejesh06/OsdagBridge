import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdditionalInputsModal({
  open,
  onClose,
}: Props) {
  const green = "#95b80f";

  const topTabs = [
    "Typical Section Details",
    "Member Properties",
    "Loading",
    "Support Conditions",
    "Analysis/Design Options",
    "Design Options (Cont.)",
  ];

  const bottomTabs = [
    "Layout",
    "Crash Barrier",
    "Median",
    "Railing",
    "Wearing Course",
    "Lane Details",
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(4px)",
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          transition={{
            duration: 0.25,
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 40,
              rotateX: -8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 170,
            }}
            style={{
              width: "84%",
              height: "90%",
              background: "#efefef",
              border: "1px solid #8b8b8b",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              borderRadius: "4px",
              overflow: "hidden",
              fontFamily: "sans-serif",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                height: "54px",
                background: "#ececec",
                borderBottom: "1px solid #9f9f9f",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Additional Inputs
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  fontSize: "12px",
                  alignItems: "center",
                }}
              >
                <span style={{ cursor: "pointer" }}>−</span>
                <span style={{ cursor: "pointer" }}>□</span>

                <span
                  onClick={onClose}
                  style={{ cursor: "pointer" }}
                >
                  ×
                </span>
              </div>
            </div>

            {/* TOP TABS */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #7a7a7a",
                background: "#efefef",
              }}
            >
              {topTabs.map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "8px 14px",
                    borderRight: "1px solid #7a7a7a",
                    background: i === 0 ? green : "#ececec",
                    color: i === 0 ? "white" : "#555",
                    fontSize: "12px",
                    lineHeight: "22px",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* CAD PLACEHOLDER */}
            <div
              style={{
                margin: "10px",
                border: "1px solid #555",
                borderRadius: "10px",
                background: "#dcdcdc",
                height: "270px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                }}
              >
                CAD PREVIEW PLACEHOLDER
              </div>
            </div>

            {/* LOWER TABS */}
            <div
              style={{
                display: "flex",
                margin: "0 14px",
                border: "1px solid #555",
              }}
            >
              {bottomTabs.map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    flex: 1,
                    padding: "8px",
                    textAlign: "center",
                    borderRight:
                      i !== bottomTabs.length - 1
                        ? "1px solid #555"
                        : "none",
                    background: i === 0 ? green : "#ececec",
                    color: i === 0 ? "white" : "#555",
                    fontSize: "12px",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* FORM */}
            <div
              style={{
                flex: 1,
                margin: "14px",
                border: "1px solid #555",
                borderRadius: "12px",
                background: "#f7f7f7",
                padding: "18px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "15px",
                }}
              >
                Inputs:
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 240px 1fr 240px",
                  rowGap: "14px",
                  columnGap: "30px",
                  alignItems: "center",
                }}
              >
                <Label>Girder Spacing (m):</Label>
                <Input />

                <Label>No. of Girders:</Label>
                <Input />

                <Label>Deck Overhang Width (m):</Label>
                <Input />

                <div
                  style={{
                    fontSize: "12px",
                    fontStyle: "italic",
                  }}
                >
                  Values adjusted for:
                </div>

                <div />

                <Label>Overall Bridge Width (m):</Label>
                <Input />

                <div />
                <div />

                <Label>Deck Thickness (mm):</Label>
                <Input />

                <div />
                <div />

                <Label>Footpath Thickness (mm):</Label>
                <Input />

                <Label>Footpath Width (m):</Label>
                <Input />
              </div>
            </div>

            {/* FOOTER */}
            <div
              style={{
                height: "54px",
                background: "#d8d8d8",
                borderTop: "1px solid #aaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "240px",
              }}
            >
              <button
                style={{
                  width: "90px",
                  height: "30px",
                  fontSize: "14px",
                  background: "#efefef",
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Defaults
              </button>

              <button
                style={{
                  width: "90px",
                  height: "30px",
                  fontSize: "14px",
                  background: "#efefef",
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: any) {
  return (
    <div
      style={{
        fontSize: "14px",
      }}
    >
      {children}
    </div>
  );
}

function Input() {
  return (
    <input
      style={{
        width: "70%",
        height: "24px",
        borderRadius: "14px",
        border: "2px solid #444",
        background: "#f7f7f7",
        padding: "0 12px",
        fontSize: "12px",
      }}
    />
  );
}