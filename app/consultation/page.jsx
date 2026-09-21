import { Suspense } from "react";
import ConsultationClient from "./ConsultationClient";

export default function ConsultationPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "#0B131E", minHeight: "100vh" }}>
          Connecting to consultation room...
        </div>
      }
    >
      <ConsultationClient />
    </Suspense>
  );
}
