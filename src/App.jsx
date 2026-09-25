import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import HomePage from "./pages/HomePage";
const PlayerPage = lazy(() => import("./pages/PlayerPage"));
const LiveGamesPage = lazy(() => import("./pages/LiveGamesPage"));
const StandingsPage = lazy(() => import("./pages/StandingsPage"));
const TeamRosterPage = lazy(() => import("./pages/TeamRosterPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const HighlightsPage = lazy(() => import("./pages/HighlightsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const WembyAnimDemoPage = lazy(() => import("./pages/WembyAnimDemoPage"));
import RequireAdmin from "./components/admin/RequireAdmin";

export default function App() {
  return (
    <AuthProvider>
      {import.meta.env.DEV && !isSupabaseConfigured && (
        <div className="supabase-env-banner" role="status">
          Preview mode · Live player data is not connected.
        </div>
      )}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <div id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <div
              className="container"
              role="status"
              style={{ padding: "4rem 0" }}
            >
              Loading the next play…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/player/:id" element={<PlayerPage />} />
            <Route path="/live-games" element={<LiveGamesPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/team/:teamSlug/roster" element={<TeamRosterPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/highlights" element={<HighlightsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/anim-demo" element={<WembyAnimDemoPage />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route
              path="*"
              element={
                <main className="container" style={{ padding: "4rem 0" }}>
                  <h1>That play is out of bounds.</h1>
                  <p>This page doesn’t exist.</p>
                  <a href="/">Back to the player board →</a>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}
