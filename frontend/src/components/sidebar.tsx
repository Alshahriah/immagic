import { Link } from "react-router-dom"

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-card p-4 hidden md:block min-h-screen">
      <nav className="space-y-2">
        <Link to="/" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
          Photos
        </Link>
        <Link to="/explore" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
          Explore
        </Link>
        <Link to="/jobs" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
          Job Queue
        </Link>
        <div className="pt-4 mt-4 border-t">
          <Link to="/settings" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Settings
          </Link>
        </div>
      </nav>
    </div>
  )
}
