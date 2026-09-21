"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Calendar, FileText, Folder, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Prescriptions", href: "/prescriptions", icon: FileText },
    { label: "Records", href: "/medical-records", icon: Folder },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "64px",
        zIndex: 90,
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              fontWeight: isActive ? "700" : "500",
              fontSize: "0.725rem",
              textDecoration: "none",
            }}
          >
            <Icon size={20} style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <style jsx global>{`
        @media (min-width: 869px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
