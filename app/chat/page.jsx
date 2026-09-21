import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading chat interface...
        </div>
      }
    >
      <ChatClient />
    </Suspense>
  );
}
