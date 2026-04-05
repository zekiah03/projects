import { useState, type FormEvent } from "react";
import { useAuthContext } from "./AuthProvider";

export function LoginForm() {
  const { signIn, signUp } = useAuthContext();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>TWIN WORLD</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          minLength={6}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={styles.link}
        >
          {mode === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "2rem",
    letterSpacing: "0.3em",
    color: "#7df9ff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "320px",
    padding: "2rem",
    background: "#1a1a2e",
    borderRadius: "8px",
  },
  input: {
    padding: "0.6rem",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "#0f0f23",
    color: "#e0e0e0",
    fontSize: "1rem",
  },
  button: {
    padding: "0.7rem",
    borderRadius: "4px",
    border: "none",
    background: "#7df9ff",
    color: "#0a0a0a",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#7df9ff",
    cursor: "pointer",
    fontSize: "0.85rem",
    textDecoration: "underline",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "0.85rem",
  },
};
