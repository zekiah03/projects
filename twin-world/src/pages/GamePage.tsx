import { useEffect, useState } from "react";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { GameCanvas } from "@/engine/GameCanvas";
import { JsonUploader } from "@/features/upload/JsonUploader";
import { realtimeManager } from "@/lib/websocket";

export function GamePage() {
  const { user, signOut } = useAuthContext();
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  useEffect(() => {
    // デモ用: 仮のセッションIDでWebSocket接続
    const sessionId = "demo-session";
    setWsStatus("connecting");

    realtimeManager
      .connect(sessionId)
      .then(() => setWsStatus("connected"))
      .catch(() => setWsStatus("disconnected"));

    return () => {
      realtimeManager.disconnect();
      setWsStatus("disconnected");
    };
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>TWIN WORLD</h1>
        <div style={styles.headerRight}>
          <span style={styles.wsIndicator}>
            WS:{" "}
            <span
              style={{
                color:
                  wsStatus === "connected"
                    ? "#4caf50"
                    : wsStatus === "connecting"
                      ? "#ffeb3b"
                      : "#ff6b6b",
              }}
            >
              {wsStatus}
            </span>
          </span>
          <span style={styles.userName}>{user?.email}</span>
          <button onClick={signOut} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <GameCanvas />
        <aside style={styles.sidebar}>
          <JsonUploader />
          <div style={styles.infoBox}>
            <h3>Info</h3>
            <p>Character: 1 entity displayed</p>
            <p>Session: demo-session</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    background: "#1a1a2e",
    borderBottom: "1px solid #333",
  },
  title: {
    fontSize: "1.4rem",
    letterSpacing: "0.2em",
    color: "#7df9ff",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  wsIndicator: {
    fontSize: "0.85rem",
  },
  userName: {
    fontSize: "0.85rem",
    color: "#aaa",
  },
  logoutBtn: {
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    border: "1px solid #555",
    background: "transparent",
    color: "#e0e0e0",
    cursor: "pointer",
  },
  main: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    flex: 1,
  },
  sidebar: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  infoBox: {
    padding: "1rem",
    background: "#1a1a2e",
    borderRadius: "8px",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },
};
