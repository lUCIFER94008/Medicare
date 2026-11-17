import { Suspense } from "react";
import ConsultationClient from "./ConsultationClient";
import { RefreshCw } from "lucide-react";

export default function ConsultationPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "80px 20px",
            textAlign: "center",
            color: "var(--text-dark)",
            backgroundColor: "var(--bg-light)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: "40px",
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#FFFFFF",
              textAlign: "center",
            }}
          >
            <RefreshCw size={36} className="spin" style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>
              Loading Consultation Room
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Establishing secure connection...
            </p>
          </div>
        </div>
      }
    >
      <ConsultationClient />
    </Suspense>
  );
}
