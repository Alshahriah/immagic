import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Search, LogOut, Bell, Menu } from "lucide-react"

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const toggleSidebar = useAuthStore((state) => state.toggleSidebar)
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
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="rounded-full h-10 w-10 text-muted-foreground"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-2xl group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              placeholder="Search your photos" 
              className="pl-14 bg-muted/40 border-none ring-offset-background focus-visible:ring-0 focus-visible:bg-background focus-visible:shadow-md transition-all rounded-lg h-12 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full h-10 w-10">
            <Bell className="w-5 h-5" />
          </Button>
          
          {user && (
            <Button variant="ghost" className="rounded-full p-1 h-10 w-10 ml-2 border border-transparent hover:border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-10 w-10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
