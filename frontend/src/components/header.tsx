import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useState } from "react"

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        if (query.trim()) {
            navigate(`/?q=${encodeURIComponent(query)}`)
        } else {
            navigate("/")
        }
    }
  }

  return (
    <header className="flex h-16 items-center border-b px-6 bg-card">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-lg font-semibold">Immagic</h2>
        <div className="max-w-md w-full">
          <Input 
            placeholder="Search images (OCR, tags, filename)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-muted-foreground">Hi, {user.username}</span>}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
