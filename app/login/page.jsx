"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartPulse, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (registered) {
      setSuccessMessage("Account registered successfully! Please sign in below.");
    }
  }, [registered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Please enter both email and password.");
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-light)",
        minHeight: "calc(100vh - 76px - 100px)",
        padding: "60px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card-base"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "16px",
              backgroundColor: "var(--secondary)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <HeartPulse size={30} />
          </div>
          <h2 className="heading-lg" style={{ fontSize: "1.75rem", marginBottom: "8px" }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Sign in to access your MediCare telemedicine account.
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#047857",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "8px" }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "28px",
            padding: "16px",
            backgroundColor: "var(--primary-light)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.825rem",
            color: "var(--text-dark)",
          }}
        >
          <strong>Demo Test Login Credentials:</strong>
          <ul style={{ marginTop: "6px", paddingLeft: "16px", lineHeight: "1.5" }}>
            <li>
              <strong>Admin:</strong> admin@medicare.com / adminpassword123
            </li>
            <li>
              <strong>Doctor:</strong> dr.sarah@medicare.com / doctorpassword123
            </li>
            <li>
              <strong>Patient:</strong> john.patient@gmail.com / patientpassword123
            </li>
          </ul>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Don't have an account yet?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
