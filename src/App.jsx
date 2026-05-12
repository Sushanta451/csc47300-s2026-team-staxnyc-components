import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import PlayerPage from './pages/PlayerPage'
import LiveGamesPage from './pages/LiveGamesPage'
import StandingsPage from './pages/StandingsPage'
import ComparePage from './pages/ComparePage'
import HighlightsPage from './pages/HighlightsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import RequireAdmin from './components/admin/RequireAdmin'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/live-games" element={<LiveGamesPage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/highlights" element={<HighlightsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Routes>
    </AuthProvider>
  )
}
