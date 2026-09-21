"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Shield, User, MessageSquare, Maximize2 } from "lucide-react";

export default function ConsultationPage() {
  const router = useRouter();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [callEnded, setCallEnded] = useState(false);

  const handleEndCall = () => {
    setCallEnded(true);
    setTimeout(() => {
      router.push("/patient/dashboard");
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: "#0F172A", minHeight: "calc(100vh - 76px)", color: "#FFFFFF", padding: "32px 0" }}>
      <div className="container">
        {/* Call Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <span className="badge" style={{ backgroundColor: "#065F46", color: "#34D399", marginBottom: "8px" }}>
              ● Encrypted Tele-Health Live Session
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>
              MediCare Live Video Consultation
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#94A3B8" }}>
            <Shield size={16} /> 256-Bit SSL Encrypted
          </div>
        </div>

        {callEnded ? (
          <div className="card-base" style={{ padding: "60px", textAlign: "center", backgroundColor: "#1E293B", color: "#FFFFFF" }}>
            <PhoneOff size={48} style={{ color: "#EF4444", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>Consultation Ended</h3>
            <p style={{ color: "#94A3B8" }}>Redirecting back to your dashboard...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "24px" }}>
            {/* Main Video Screen Container */}
            <div
              style={{
                backgroundColor: "#1E293B",
                borderRadius: "var(--radius-xl)",
                height: "560px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #334155",
              }}
            >
              {/* Doctor Video Avatar / Canvas */}
              {videoEnabled ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      fontWeight: "700",
                      marginBottom: "16px",
                      boxShadow: "0 0 40px rgba(8,127,140,0.5)",
                    }}
                  >
                    Dr
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Dr. Sarah Johnson</h3>
                  <p style={{ color: "#34D399", fontSize: "0.85rem", marginTop: "4px" }}>
                    ● Connected & Listening
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#94A3B8" }}>
                  <VideoOff size={48} style={{ marginBottom: "12px" }} />
                  <p>Camera is turned off</p>
                </div>
              )}

              {/* Patient Self PIP Box */}
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  right: "24px",
                  width: "160px",
                  height: "110px",
                  backgroundColor: "#0F172A",
                  borderRadius: "var(--radius-md)",
                  border: "2px solid var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Self View</span>
              </div>

              {/* Call Controls Overlay Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  backdropFilter: "blur(12px)",
                  padding: "12px 28px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid #334155",
                }}
              >
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: micEnabled ? "#334155" : "#EF4444",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: videoEnabled ? "#334155" : "#EF4444",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                  onClick={handleEndCall}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhoneOff size={22} />
                </button>
              </div>
            </div>

            {/* Side Consultation Notes & Chat Sidebar */}
            <div
              style={{
                backgroundColor: "#1E293B",
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", color: "var(--secondary)" }}>
                In-Call Clinical Notes
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", lineHeight: "1.6", marginBottom: "20px" }}>
                Doctors can issue digital prescriptions during live video calls which automatically save to your patient dashboard.
              </p>

              <Link href="/chat" className="btn btn-primary" style={{ marginTop: "auto", width: "100%" }}>
                <MessageSquare size={16} /> Open Text Chat
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
