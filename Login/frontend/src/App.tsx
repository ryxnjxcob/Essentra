// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Header from "@/components/ui/Header";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardContainer from "@/pages/DashboardContainer";
import BoardLoader from "@/pages/BoardLoader";
import NotepadEditor from "@/pages/NotepadEditor";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { getCurrentUser } from "@/api/me";
import { User } from "@/types";

const AppWrapper: React.FC = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const normalizeUser = (u: any): User => {
  const name =
    (u.first_name || u.last_name
      ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
      : u.name) || u.email;
  const avatar =
    u.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      name || "User",
    )}`;
  return {
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    name,
    avatar,
  };
};

const App: React.FC = () => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        if (me) {
          setUser(normalizeUser(me));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    navigate("/app/login");
  };

  if (loadingUser) {
    return (
      <div className="bg-white dark:bg-black w-full h-screen flex items-center justify.center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header
        user={user}
        isDark={isDark}
        toggleTheme={() => setIsDark((prev) => !prev)}
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
          <Route
            path="/"
            element={
              <LandingPage onGetStarted={() => navigate("/app/register")} />
            }
          />

          <Route
            path="/app/login"
            element={
              <LoginPage
                onLoginSuccess={(u) => {
                  const mapped = normalizeUser(u);
                  setUser(mapped);
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
                  const mapped = normalizeUser(u);
                  setUser(mapped);
                  navigate("/app/dashboard");
                }}
                onNavigateToLogin={() => navigate("/app/login")}
              />
            }
          />

          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardContainer user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/board/:id"
            element={
              <ProtectedRoute user={user}>
                <BoardLoader
                  isDark={isDark}
                  toggleTheme={() => setIsDark((prev) => !prev)}
                />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppWrapper;
