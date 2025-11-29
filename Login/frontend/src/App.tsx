import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Header from "./components/ui/Header";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardContainer from "./pages/DashboardContainer";
import BoardEditor from "./pages/BoardEditor";
import NotepadEditor from "./pages/NotepadEditor";
import ProtectedRoute from "./routes/ProtectedRoute";
import { getCurrentUser } from "./api/me";

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Auto-login check
  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getCurrentUser();
        setUser(me);
      } catch {
        setUser(null);
      }
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  if (loadingUser) {
    return <div className="bg-white dark:bg-black w-full h-screen" />;
  }

  const handleLogout = () => {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    navigate("/app/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Global Header */}
      <Header
        user={user}
        isDark={isDark}
        toggleTheme={() => setIsDark((p) => !p)}
        setView={(page) => {
          if (page === "landing") navigate("/");
          if (page === "login") navigate("/app/login");
          if (page === "register") navigate("/app/register");
          if (page === "dashboard") navigate("/app/dashboard");
        }}
        notifications={[]}
        onApproveRequest={() => {}}
        onRejectRequest={() => {}}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          {/* Landing */}
          <Route
            path="/"
            element={
              <LandingPage onGetStarted={() => navigate("/app/register")} />
            }
          />

          {/* Auth */}
          <Route
            path="/app/login"
            element={
              <LoginPage
                onLoginSuccess={(u) => {
                  setUser(u);
                  navigate("/app/dashboard");
                }}
                onNavigateToRegister={() => navigate("/app/register")}
              />
            }
          />

          <Route
            path="/app/register"
            element={
              <RegisterPage
                onRegisterSuccess={(u) => {
                  setUser(u);
                  navigate("/app/dashboard");
                }}
                onNavigateToLogin={() => navigate("/app/login")}
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardContainer user={user} />
              </ProtectedRoute>
            }
          />

          {/* Board + Notepad */}
          <Route
            path="/app/board/:id"
            element={
              <ProtectedRoute user={user}>
                <BoardEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/notepad/:id"
            element={
              <ProtectedRoute user={user}>
                <NotepadEditor />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppWrapper;
