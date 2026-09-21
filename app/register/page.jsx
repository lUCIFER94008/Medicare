"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartPulse, User, Mail, Phone, Lock, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "General Physician",
    qualification: "",
    experience: "",
    consultationFee: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Full Name is required.");
    if (!formData.email.trim()) return setError("Email is required.");
    if (!formData.phone.trim()) return setError("Phone number is required.");
    if (!formData.password) return setError("Password is required.");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    if (formData.role === "doctor") {
      if (!formData.qualification.trim()) return setError("Doctor qualification is required.");
      if (!formData.experience.trim()) return setError("Years of experience is required.");
      if (!formData.consultationFee) return setError("Consultation fee is required.");
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (!res.success) {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-light)",
        minHeight: "calc(100vh - 76px - 100px)",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card-base"
        style={{
          width: "100%",
          maxWidth: "600px",
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
            Create Your Account
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Join MediCare to access remote doctor consultations and digital health records.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              I want to register as a:
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                backgroundColor: "var(--bg-light)",
                padding: "6px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "patient" })}
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  backgroundColor: formData.role === "patient" ? "var(--primary)" : "transparent",
                  color: formData.role === "patient" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "var(--transition)",
                }}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "doctor" })}
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  backgroundColor: formData.role === "doctor" ? "var(--primary)" : "transparent",
                  color: formData.role === "doctor" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "var(--transition)",
                }}
              >
                Doctor
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              Full Name *
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.role === "doctor" ? "e.g. Dr. Sarah Johnson" : "e.g. John Doe"}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                Email Address *
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                Phone Number *
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555 123 4567"
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
          </div>

          {formData.role === "doctor" && (
            <div
              style={{
                backgroundColor: "var(--primary-light)",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h4 style={{ color: "var(--primary)", fontSize: "0.95rem", fontWeight: "700" }}>
                Doctor Professional Details
              </h4>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.925rem",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Qualification *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Experience *
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 10+ Yrs Exp."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Consultation Fee ($ USD) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                Password *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                Confirm Password *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "12px" }}
          >
            {loading ? "Registering Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have a MediCare account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "700" }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
