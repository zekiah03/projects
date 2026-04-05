import { AuthProvider, useAuthContext } from "@/features/auth/AuthProvider";
import { AuthPage } from "@/pages/AuthPage";
import { GamePage } from "@/pages/GamePage";

function AppRouter() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#7df9ff",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  return user ? <GamePage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
