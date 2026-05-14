import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GardenProvider, useGarden } from './contexts/GardenContext'
import { BottomNav } from './components/BottomNav'
import { LoginPage } from './pages/LoginPage'
import { GardenSetup } from './pages/GardenSetup'
import { Home } from './pages/Home'
import { Overview } from './pages/Overview'
import { ItemDetail } from './pages/ItemDetail'
import { RemindersPage } from './pages/RemindersPage'
import { Profile } from './pages/Profile'

function AppRoutes() {
  const { user, loading: authLoading } = useAuth()
  const { gardenId, loading: gardenLoading } = useGarden()

  if (authLoading || gardenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🌿</div>
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (!gardenId) return <GardenSetup />

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GardenProvider>
          <AppRoutes />
        </GardenProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
