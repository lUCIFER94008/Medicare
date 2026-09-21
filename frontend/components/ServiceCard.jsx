import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ icon: Icon, title, description, badgeText, linkHref = "/doctors" }) {
  return (
    <div
      className="card-base"
      style={{
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {badgeText && (
        <span
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            fontSize: "0.75rem",
            fontWeight: "700",
            backgroundColor: "var(--secondary)",
            color: "var(--primary)",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {badgeText}
        </span>
      )}

      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--secondary)",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        {Icon && <Icon size={28} />}
      </div>

      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: "12px",
          color: "var(--text-dark)",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          marginBottom: "24px",
          flexGrow: 1,
        }}
      >
        {description}
      </p>

      <Link
        href={linkHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--primary)",
          fontWeight: "600",
          fontSize: "0.925rem",
          transition: "var(--transition)",
        }}
      >
        Learn More <ArrowRight size={16} />
      </Link>
    </div>
  );
}
