import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function JsonUploader() {
  const { user } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !user) return;

    setStatus("uploading");
    setMessage("");

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const { error } = await supabase.from("game_data").insert({
        user_id: user.id,
        data_type: json.type ?? "unknown",
        payload: json,
      });

      if (error) throw error;

      setStatus("done");
      setMessage(`Saved: ${file.name}`);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div style={styles.container}>
      <h3>JSON Upload</h3>
      <div style={styles.row}>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={styles.fileInput}
        />
        <button
          onClick={handleUpload}
          disabled={status === "uploading"}
          style={styles.button}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </div>
      {message && (
        <p style={{ color: status === "error" ? "#ff6b6b" : "#4caf50" }}>
          {message}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "1rem",
    background: "#1a1a2e",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  row: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    marginTop: "0.5rem",
  },
  fileInput: {
    color: "#e0e0e0",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    border: "none",
    background: "#7df9ff",
    color: "#0a0a0a",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
