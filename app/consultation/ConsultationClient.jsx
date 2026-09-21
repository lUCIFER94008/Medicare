"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  PhoneOff,
  HeartPulse,
  Clock,
  Calendar,
  User as UserIcon,
  AlertCircle,
  FileText,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ConsultationClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Video Media State
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [endCallModalOpen, setEndCallModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Chat in consultation state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user && appointmentId) {
      fetchAppointmentDetails(appointmentId);
    }
  }, [user, appointmentId, authLoading, isAuthenticated]);

  useEffect(() => {
    if (appointment) {
      initCamera();
    }
    return () => {
      stopCamera();
    };
  }, [appointment]);

  useEffect(() => {
    if (chatOpen && appointmentId) {
      fetchConsultationMessages();
      const interval = setInterval(fetchConsultationMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatOpen, appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAppointmentDetails = async (id) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet(`/appointments/${id}`);
      if (res.success) {
        setAppointment(res.data);
      } else {
        setError(res.message || "Unable to load consultation details.");
      }
    } catch (err) {
      console.error("Consultation fetch error:", err);
      setError("Unauthorized or invalid appointment consultation link.");
    } finally {
      setLoading(false);
    }
  };

  const initCamera = async () => {
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Media device access warning:", err);
      setMediaError("Camera or microphone permission is required for live preview.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    } else {
      setMicActive(!micActive);
    }
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
        setCameraActive(!cameraActive);
      }
    } else {
      setCameraActive(!cameraActive);
    }
  };

  const fetchConsultationMessages = async () => {
    try {
      const res = await apiGet(`/messages?appointmentId=${appointmentId}`);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Consultation chat fetch error:", err);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg) return;

    const textToSend = chatInput.trim();
    setChatInput("");

    try {
      setSendingMsg(true);
      const res = await apiPost("/messages", {
        appointmentId,
        message: textToSend,
      });
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleEndCall = () => {
    stopCamera();
    router.push("/appointments");
  };

  if (authLoading || loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        Connecting to consultation room...
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "#991B1B" }}>
        <AlertCircle size={44} style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>
          Consultation Access Denied
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "450px", margin: "0 auto 24px" }}>
          {error || "You do not have authorization to join this consultation."}
        </p>
        <Link href="/appointments" className="btn btn-primary">
          Back to My Appointments
        </Link>
      </div>
    );
  }

  const isPatient = user?.role === "patient";
  const doctor = appointment.doctorId || {};
  const patient = appointment.patientId || {};
  const partnerName = isPatient ? doctor.name || "Doctor" : patient.name || "Patient";
  const partnerSubtext = isPatient ? doctor.specialization || "General Specialist" : patient.email;

  return (
    <div
      style={{
        backgroundColor: "#0B131E",
        color: "#FFFFFF",
        minHeight: "calc(100vh - 76px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Consultation Header Bar */}
      <div
        style={{
          height: "64px",
          backgroundColor: "#111827",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "var(--primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartPulse size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#FFFFFF" }}>
              MediCare Telemedicine Call
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
              {appointment.appointmentDate} • {appointment.appointmentTime}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10B981",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ● {appointment.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Consultation Room Body */}
      <div style={{ flexGrow: 1, display: "flex", padding: "20px", gap: "20px", position: "relative" }}>
        {/* Main Video Frame */}
        <div
          style={{
            flexGrow: 1,
            backgroundColor: "#172131",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Main Remote / Waiting Video View */}
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                backgroundColor: "var(--secondary)",
                color: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                fontWeight: "800",
                marginBottom: "20px",
                boxShadow: "0 0 30px rgba(8, 127, 91, 0.3)",
              }}
            >
              {partnerName.charAt(0)}
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", marginBottom: "8px", color: "#FFFFFF" }}>
              Waiting for {partnerName}...
            </h2>

            <p style={{ color: "#9CA3AF", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto 20px" }}>
              {isPatient
                ? `Dr. ${doctor.name || "Johnson"} will connect to this video consultation session shortly.`
                : `Patient ${patient.name} is scheduled for this session.`}
            </p>

            {mediaError && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#FCA5A5",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  display: "inline-block",
                }}
              >
                ⚠️ {mediaError}
              </div>
            )}
          </div>

          {/* Self Camera Live Preview Box */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "200px",
              height: "140px",
              backgroundColor: "#0B131E",
              borderRadius: "16px",
              overflow: "hidden",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)", // Mirror preview
                display: cameraActive ? "block" : "none",
              }}
            />

            {!cameraActive && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#1F2937",
                  color: "#9CA3AF",
                  fontSize: "0.8rem",
                }}
              >
                Camera Off
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "10px",
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "0.7rem",
                color: "#FFFFFF",
              }}
            >
              You ({user?.name})
            </div>
          </div>
        </div>

        {/* Right Consultation Side Panel (Desktop) */}
        <aside
          style={{
            width: "320px",
            backgroundColor: "#111827",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flexShrink: 0,
          }}
          className="consultation-sidebar"
        >
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "12px", color: "var(--secondary)" }}>
              Appointment Summary
            </h4>

            <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "10px", color: "#D1D5DB" }}>
              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Consulting Doctor</span>
                <p style={{ fontWeight: "700", color: "#FFFFFF" }}>{doctor.name || "Doctor Profile"}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>{doctor.specialization}</p>
              </div>

              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Consultation Reason</span>
                <p style={{ lineHeight: "1.4" }}>{appointment.reason}</p>
              </div>

              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Fee Status</span>
                <p style={{ fontWeight: "600", color: "#10B981" }}>Paid (${doctor.consultationFee || 45})</p>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: 0 }} />

          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "10px", color: "#FFFFFF" }}>
              Quick Medical Actions
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/prescriptions" className="btn btn-outline" style={{ justifyContent: "flex-start", gap: "8px", fontSize: "0.825rem", borderColor: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
                <FileText size={16} /> View Prescriptions
              </Link>
              <Link href="/medical-records" className="btn btn-outline" style={{ justifyContent: "flex-start", gap: "8px", fontSize: "0.825rem", borderColor: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
                <FileText size={16} /> Medical Reports
              </Link>
            </div>
          </div>
        </aside>

        {/* Embedded Chat Drawer / Modal */}
        {chatOpen && (
          <div
            style={{
              position: "absolute",
              right: "20px",
              bottom: "80px",
              top: "20px",
              width: "360px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "var(--text-dark)",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={18} /> In-Call Chat
              </h4>
              <button onClick={() => setChatOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--primary)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flexGrow: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((m) => {
                const isMine = m.senderId?._id === user._id || m.senderId === user._id;
                return (
                  <div key={m._id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: isMine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        backgroundColor: isMine ? "#DDF7EC" : "#F3F4F6",
                        fontSize: "0.85rem",
                      }}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendChat} style={{ padding: "12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Type message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flexGrow: 1, padding: "10px", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}
              />
              <button type="submit" disabled={sendingMsg} className="btn btn-primary" style={{ padding: "10px", borderRadius: "10px" }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div
        style={{
          height: "80px",
          backgroundColor: "#111827",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={toggleMic}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: micActive ? "rgba(255,255,255,0.15)" : "#EF4444",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title={micActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micActive ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleCamera}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: cameraActive ? "rgba(255,255,255,0.15)" : "#EF4444",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
        >
          {cameraActive ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: chatOpen ? "var(--primary)" : "rgba(255,255,255,0.15)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Toggle In-Call Chat"
        >
          <MessageSquare size={22} />
        </button>

        <button
          onClick={() => setEndCallModalOpen(true)}
          style={{
            width: "56px",
            height: "50px",
            borderRadius: "16px",
            border: "none",
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "700",
            padding: "0 16px",
            gap: "6px",
          }}
          title="End Consultation"
        >
          <PhoneOff size={22} />
        </button>
      </div>

      {/* End Call Confirmation Modal */}
      {endCallModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              color: "var(--text-dark)",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <PhoneOff size={40} style={{ color: "#DC2626", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "8px" }}>
              End Consultation Call?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Are you sure you want to exit this video consultation session?
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setEndCallModalOpen(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleEndCall}
                className="btn btn-primary"
                style={{ flex: 1, backgroundColor: "#DC2626", borderColor: "#DC2626" }}
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .consultation-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
