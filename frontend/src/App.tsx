import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "./pages/login"
import { Dashboard } from "./pages/dashboard"
import { JobQueue } from "./pages/jobs"
import { SettingsPage } from "./pages/settings"
import { ExplorePage } from "./pages/explore"
import { Layout } from "./components/layout"
import { useAuthStore } from "./lib/store"

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobQueue />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="explore" element={<ExplorePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
