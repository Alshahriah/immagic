import { Link, useLocation } from "react-router-dom"
import { Image, Compass, Activity, Settings, Zap, Star, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"

export function Sidebar() {
  const location = useLocation()
  const collapsed = useAuthStore((state) => state.sidebarCollapsed)

  const navItems = [
    { label: "Photos", path: "/", icon: Image },
    { label: "Explore", path: "/explore", icon: Compass },
    { label: "Favorites", path: "#", icon: Star },
    { label: "Archive", path: "#", icon: Archive },
  ]

  const managementItems = [
    { label: "Job Queue", path: "/jobs", icon: Activity },
    { label: "Settings", path: "/settings", icon: Settings },
  ]

  return (
    <aside className={cn(
      "bg-background hidden md:flex flex-col h-screen sticky top-0 px-2 py-4 gap-4 transition-all duration-300 border-r border-transparent",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("px-6 py-4 mb-2 flex items-center", collapsed ? "justify-center px-0" : "")}>
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary fill-current" />
          {!collapsed && <span className="text-xl font-medium tracking-tight text-foreground/80">Immagic</span>}
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <SidebarLink 
            key={item.label} 
            {...item} 
            active={location.pathname === item.path} 
            collapsed={collapsed}
          />
        ))}
        
        <div className={cn("pt-6 pb-2 px-6", collapsed ? "px-0 flex justify-center" : "")}>
          {collapsed ? (
            <div className="h-px w-8 bg-border" />
          ) : (
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Management</h3>
          )}
        </div>

        {managementItems.map((item) => (
          <SidebarLink 
            key={item.label} 
            {...item} 
            active={location.pathname === item.path} 
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  )
}

function SidebarLink({ label, path, icon: Icon, active, collapsed }: { label: string, path: string, icon: any, active?: boolean, collapsed?: boolean }) {
  return (
    <Link 
      to={path} 
      title={collapsed ? label : ""}
      className={cn(
        "flex items-center rounded-full text-sm font-medium transition-colors",
        collapsed ? "justify-center w-12 h-12 mx-auto" : "gap-4 px-6 py-3",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-foreground/70 hover:bg-muted"
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary fill-current" : "")} />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}
