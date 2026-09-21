"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, ShieldCheck, Calendar, ArrowLeft, LogOut } from "lucide-react";

export default function ProfilePageClient() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading user profile...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "40px 20px" }}>
      <div className="container" style={{ maxWidth: "760px" }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary)",
            fontWeight: "600",
            marginBottom: "24px",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass-card" style={{ padding: "36px", backgroundColor: "#FFFFFF" }}>
          {/* User Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              paddingBottom: "24px",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "var(--primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "2rem",
                boxShadow: "0 6px 20px rgba(8, 127, 91, 0.25)",
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 className="heading-lg" style={{ fontSize: "1.6rem" }}>
                  {user.name}
                </h1>
                <span className="badge" style={{ textTransform: "capitalize" }}>
                  <ShieldCheck size={14} /> {user.role}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
                MediCare Telemedicine Account
              </p>
            </div>
          </div>

          {/* Profile Details List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--bg-light)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <User size={20} style={{ color: "var(--primary)" }} />
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Full Name</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-dark)" }}>{user.name}</strong>
              </div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--bg-light)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <Mail size={20} style={{ color: "var(--primary)" }} />
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Email Address</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-dark)" }}>{user.email}</strong>
              </div>
            </div>

            {user.phone && (
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--bg-light)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <Phone size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Phone Number</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-dark)" }}>{user.phone}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Logout & Action Buttons */}
          <div style={{ display: "flex", gap: "14px" }}>
            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ flex: 1, color: "#DC2626", borderColor: "#FCA5A5", gap: "8px" }}
            >
              <LogOut size={18} /> Sign Out of MediCare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
