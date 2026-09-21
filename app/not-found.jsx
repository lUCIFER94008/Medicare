import Link from "next/link";
import { HeartPulse, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-light)",
        minHeight: "calc(100vh - 76px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "50px 36px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            backgroundColor: "var(--mint)",
            color: "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <HeartPulse size={36} />
        </div>

        <h1 className="heading-lg" style={{ fontSize: "3rem", marginBottom: "8px", color: "var(--primary)" }}>
          404
        </h1>

        <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-dark)" }}>
          Page Not Found
        </h2>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.6" }}>
          The healthcare page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>

        <Link href="/" className="btn btn-primary btn-lg" style={{ gap: "8px" }}>
          <ArrowLeft size={18} /> Return to MediCare Home
        </Link>
      </div>
    </div>
  );
}
