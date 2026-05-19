import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import PlayerPage from './pages/PlayerPage'
import LiveGamesPage from './pages/LiveGamesPage'
import StandingsPage from './pages/StandingsPage'
import TeamRosterPage from './pages/TeamRosterPage'
import ComparePage from './pages/ComparePage'
import HighlightsPage from './pages/HighlightsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import UserProfilePage from './pages/UserProfilePage'
import AdminPage from './pages/AdminPage'
import WembyAnimDemoPage from './pages/WembyAnimDemoPage'
import RequireAdmin from './components/admin/RequireAdmin'

export default function App() {
  return (
    <AuthProvider>
      {import.meta.env.DEV && !isSupabaseConfigured && (
        <div className="supabase-env-banner" role="status">
          Supabase env missing: add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_KEY</code> (or <code>VITE_SUPABASE_ANON_KEY</code>) to{' '}
          <code>.env</code> in the repo root, then restart <code>npm run dev</code>. See{' '}
          <code>.env.example</code>.
        </div>
      )}
      <Navbar />
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
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Routes>
    </AuthProvider>
  )
}
