"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  Send,
  HeartPulse,
  User as UserIcon,
  Check,
  CheckCheck,
  ArrowLeft,
  Video,
  Clock,
  AlertCircle,
  Stethoscope,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function ChatClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [conversations, setConversations] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      fetchUserAppointments();
    }
  }, [user, authLoading, isAuthenticated]);

  useEffect(() => {
    if (appointmentId && user) {
      fetchActiveAppointment(appointmentId);
      fetchChatMessages(appointmentId);

      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchChatMessages(appointmentId, true);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [appointmentId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUserAppointments = async () => {
    try {
      setLoadingAppts(true);
      const res = await apiGet("/appointments");
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Error fetching chat conversations:", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  const fetchActiveAppointment = async (id) => {
    try {
      setError("");
      const res = await apiGet(`/appointments/${id}`);
      if (res.success) {
        setActiveAppointment(res.data);
      } else {
        setError(res.message || "Unable to load consultation details.");
      }
    } catch (err) {
      setError("Unauthorized or invalid appointment ID.");
    }
  };

  const fetchChatMessages = async (id, isPolling = false) => {
    try {
      if (!isPolling) setLoadingMsgs(true);
      const res = await apiGet(`/messages?appointmentId=${id}`);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      if (!isPolling) setError(err.message || "Failed to load chat history.");
    } finally {
      if (!isPolling) setLoadingMsgs(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !appointmentId || sending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");

    try {
      setSending(true);
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
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading messaging session...
      </div>
    );
  }

  const isPatient = user?.role === "patient";
  const partnerName = isPatient
    ? activeAppointment?.doctorId?.name || "Consulting Doctor"
    : activeAppointment?.patientId?.name || "Patient";

  const partnerSubtext = isPatient
    ? activeAppointment?.doctorId?.specialization || "General Specialist"
    : `Patient • ${activeAppointment?.patientId?.email || ""}`;

  return (
    <div
      style={{
        backgroundColor: "#F5FCF8",
        minHeight: "calc(100vh - 76px)",
        display: "flex",
      }}
    >
      {/* Desktop Conversations Sidebar */}
      <aside
        style={{
          width: "320px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
        className="chat-sidebar"
      >
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={20} /> MediCare Messages
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Select an appointment to open consultation chat.
          </p>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {loadingAppts ? (
            <p style={{ padding: "20px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Loading conversations...
            </p>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "0.9rem" }}>No active appointments or message history.</p>
              <Link href="/doctors" className="btn btn-outline" style={{ marginTop: "12px", fontSize: "0.8rem" }}>
                Find a Doctor
              </Link>
            </div>
          ) : (
            conversations.map((appt) => {
              const isSelected = appt._id === appointmentId;
              const doctor = appt.doctorId || {};
              const titleName = isPatient ? doctor.name || "Doctor" : appt.patientId?.name || "Patient";
              const subTitle = isPatient ? doctor.specialization || "Specialist" : appt.appointmentDate;

              return (
                <Link
                  key={appt._id}
                  href={`/chat?appointmentId=${appt._id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: isSelected ? "var(--secondary)" : "transparent",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: isSelected ? "#FFFFFF" : "var(--secondary)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {titleName.charAt(0)}
                  </div>

                  <div style={{ flexGrow: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {titleName}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{appt.appointmentDate?.substring(5)}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                      {subTitle} • <span style={{ textTransform: "capitalize", color: "var(--primary)" }}>{appt.status}</span>
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F5FCF8",
        }}
      >
        {!appointmentId ? (
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                backgroundColor: "var(--secondary)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <HeartPulse size={36} />
            </div>
            <h2 className="heading-lg" style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
              Select a Consultation Conversation
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "420px", fontSize: "0.95rem", marginBottom: "20px" }}>
              Choose an appointment from your conversation list to chat with your consulting doctor or patient.
            </p>
            <Link href="/appointments" className="btn btn-primary">
              View My Appointments
            </Link>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#991B1B" }}>
            <AlertCircle size={36} style={{ marginBottom: "12px" }} />
            <h3>{error}</h3>
            <Link href="/appointments" className="btn btn-outline" style={{ marginTop: "16px" }}>
              Back to Appointments
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Link href="/appointments" className="mobile-back" style={{ color: "var(--text-dark)" }}>
                  <ArrowLeft size={22} />
                </Link>

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "var(--secondary)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "1.1rem",
                  }}
                >
                  {partnerName.charAt(0)}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-dark)" }}>
                      {partnerName}
                    </h3>
                    {isPatient && (
                      <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "2px", fontSize: "0.75rem", fontWeight: "700" }}>
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                    {partnerSubtext} • <span style={{ color: "#047857", fontWeight: "600" }}>● Available for Consultation</span>
                  </p>
                </div>
              </div>

              {activeAppointment?.consultationType === "video" && (
                <Link
                  href={`/consultation?appointmentId=${appointmentId}`}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem", gap: "6px" }}
                >
                  <Video size={16} /> Join Consultation
                </Link>
              )}
            </div>

            {/* Messages Area */}
            <div
              style={{
                flexGrow: 1,
                padding: "24px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {loadingMsgs ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-lg)",
                    margin: "auto 0",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <MessageSquare size={36} style={{ color: "var(--primary)", marginBottom: "12px" }} />
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>
                    Start Consultation Message
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "380px", margin: "0 auto" }}>
                    Send a message to your {isPatient ? "doctor" : "patient"} regarding symptoms, prescription advice, or consultation details.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId?._id === user._id || msg.senderId === user._id;
                  const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "12px 18px",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          backgroundColor: isMine ? "#DDF7EC" : "#FFFFFF",
                          color: "var(--text-dark)",
                          border: isMine ? "1px solid #A7F3D0" : "1px solid var(--border-color)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          fontSize: "0.925rem",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.message}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "0.725rem", color: "var(--text-muted)" }}>
                        <span>{timeString}</span>
                        {isMine && (
                          <span>
                            {msg.seen ? (
                              <CheckCheck size={14} style={{ color: "var(--primary)" }} />
                            ) : (
                              <Check size={14} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px 24px",
                backgroundColor: "#FFFFFF",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder={`Type your message to ${partnerName}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "14px 20px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-light)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />

              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="btn btn-primary"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .chat-sidebar {
            display: none !important;
          }
          .mobile-back {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-back {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
