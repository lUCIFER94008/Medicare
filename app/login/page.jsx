import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
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
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>Loading login form...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
