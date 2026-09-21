"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HeartPulse, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "doctor") return "/doctor/dashboard";
    return "/patient/dashboard";
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "#FFFFFF",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: "1px solid var(--border-color)",
        transition: "var(--transition)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "76px",
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "1.5rem",
            fontWeight: "800",
            fontFamily: "'Outfit', sans-serif",
            color: "var(--primary)",
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <HeartPulse size={24} />
          </div>
          MediCare
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          <Link href="/" style={{ fontWeight: "600", color: "var(--primary)", fontSize: "0.95rem" }}>
            Home
          </Link>
          <Link href="/doctors" style={{ fontWeight: "500", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Doctors
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/appointments" style={{ fontWeight: "500", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Appointments
              </Link>
              <Link href="/prescriptions" style={{ fontWeight: "500", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Prescriptions
              </Link>
              <Link href="/medical-records" style={{ fontWeight: "500", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Medical Records
              </Link>
            </>
          )}
          <Link href="/#about" style={{ fontWeight: "500", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            About Us
          </Link>
        </nav>

        {/* Desktop Auth Section */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href={getDashboardLink()} className="btn btn-secondary">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--bg-light)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dark)" }}>
                    {user?.name}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "600", textTransform: "capitalize" }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                title="Logout"
                style={{ padding: "10px 14px" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{ padding: "8px", color: "var(--text-dark)" }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: "var(--bg-white)",
            borderBottom: "1px solid var(--border-color)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "600", color: "var(--primary)" }}>
            Home
          </Link>
          <Link href="/doctors" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "500", color: "var(--text-muted)" }}>
            Doctors
          </Link>
          {isAuthenticated && (
            <>
              <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "600", color: "var(--primary)" }}>
                Dashboard
              </Link>
              <Link href="/appointments" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "500", color: "var(--text-muted)" }}>
                Appointments
              </Link>
              <Link href="/prescriptions" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "500", color: "var(--text-muted)" }}>
                Prescriptions
              </Link>
              <Link href="/medical-records" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: "500", color: "var(--text-muted)" }}>
                Medical Records
              </Link>
            </>
          )}
          <hr style={{ borderColor: "var(--border-color)", margin: "8px 0" }} />
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-outline"
              style={{ width: "100%" }}
            >
              <LogOut size={16} /> Logout ({user?.name})
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 868px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        @media (min-width: 869px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
