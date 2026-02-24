import React, { useState } from "react"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const formData = new URLSearchParams()
      formData.append("username", username)
      formData.append("password", password)
      
      const { data } = await api.post("/auth/login/access-token", formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      
      // In a real app, decode token to get user info or make another request
      const user = { id: 1, username: username, is_admin: true } 
      
      setAuth(data.access_token, user)
      navigate("/")
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/20">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login to Immagic</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
