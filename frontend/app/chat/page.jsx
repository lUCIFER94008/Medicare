"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../lib/api";
import { Send, MessageSquare, User, Stethoscope } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatPartners();
    }
  }, [user]);

  useEffect(() => {
    if (activePartner) {
      fetchMessages();
    }
  }, [activePartner]);

  const fetchChatPartners = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/appointments/my");
      if (res.success && res.data.length > 0) {
        setAppointments(res.data);
        // Default to first appointment doctor/patient
        const first = res.data[0];
        const partner = user.role === "patient" ? first.doctorId : first.patientId;
        setActivePartner(partner);
      }
    } catch (err) {
      console.error("Error fetching chat contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activePartner?._id) return;
    try {
      const res = await apiGet(`/messages/${activePartner._id}`);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    try {
      const res = await apiPost("/messages", {
        receiverId: activePartner._id,
        message: newMessage,
      });

      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "32px 0" }}>
      <div className="container">
        <h1 className="heading-lg" style={{ fontSize: "1.75rem", marginBottom: "24px" }}>
          Consultation Chat
        </h1>

        <div
          className="card-base"
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            height: "650px",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {/* Contacts Sidebar */}
          <div style={{ borderRight: "1px solid var(--border-color)", padding: "20px", display: "flex", flexDirection: "column" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-muted)" }}>
              Active Conversations
            </h4>

            {appointments.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No consultation conversations active.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                {appointments.map((appt) => {
                  const partner = user?.role === "patient" ? appt.doctorId : appt.patientId;
                  const isSelected = activePartner?._id === partner?._id;

                  return (
                    <button
                      key={appt._id}
                      onClick={() => setActivePartner(partner)}
                      style={{
                        padding: "12px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelected ? "var(--secondary)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textAlign: "left",
                        transition: "var(--transition)",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                        }}
                      >
                        {partner?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h5 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-dark)" }}>
                          {partner?.name || "User"}
                        </h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {appt.appointmentDate}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            {activePartner ? (
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "var(--secondary)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{activePartner.name}</h4>
                  <p style={{ fontSize: "0.75rem", color: "#047857", fontWeight: "600" }}>● Online Consultation Active</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: "20px", color: "var(--text-muted)" }}>Select a contact to start chatting</div>
            )}

            {/* Messages Body */}
            <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--bg-light)" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted)" }}>
                  <MessageSquare size={36} style={{ marginBottom: "8px" }} />
                  <p style={{ fontSize: "0.9rem" }}>No messages yet. Send a message to start consulting.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;

                  return (
                    <div
                      key={msg._id}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        backgroundColor: isMine ? "var(--primary)" : "#FFFFFF",
                        color: isMine ? "#FFFFFF" : "var(--text-dark)",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        fontSize: "0.925rem",
                        lineHeight: "1.5",
                      }}
                    >
                      <p>{msg.message}</p>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8, display: "block", textAlign: "right", marginTop: "4px" }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "12px" }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  fontSize: "0.95rem",
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "12px 20px" }}>
                <Send size={18} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
