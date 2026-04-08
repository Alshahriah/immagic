import { useState, useEffect, useRef } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trash2, FolderPlus, FileText, FolderSearch, ChevronRight, ChevronLeft } from "lucide-react"

interface ScanPath {
    id: number
    path: string
    created_at: string
}

interface Stats {
    total_images: number
    pending_ocr: number
}

interface DirItem {
    name: string
    path: string
    type: string
}

interface DirResponse {
    current_path: string
    parent_path: string
    items: DirItem[]
}

export function SettingsPage() {
  const [path, setPath] = useState("")
  const [scanning, setScanning] = useState(false)
  const [ocrRunning, setOcrRunning] = useState(false)
  const [message, setMessage] = useState("")
  const [paths, setPaths] = useState<ScanPath[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  
  // Explorer state
  const [showExplorer, setShowExplorer] = useState(false)
  const [currentDir, setCurrentDir] = useState<DirResponse | null>(null)
  const [explorerPath, setExplorerPath] = useState("/")

  const fetchPaths = async () => {
      try {
          const { data } = await api.get("/scan-paths/")
          setPaths(data)
      } catch (e) { console.error(e) }
  }

  const fetchStats = async () => {
      try {
          const { data } = await api.get("/images/stats")
          setStats(data)
      } catch (e) { console.error(e) }
  }

  const fetchDir = async (newPath: string) => {
    try {
        const { data } = await api.get(`/scan-paths/list-dirs?path=${encodeURIComponent(newPath)}`)
        setCurrentDir(data)
        setExplorerPath(data.current_path)
    } catch (e) {
        console.error(e)
        setMessage("Could not list directories for: " + newPath)
    }
  }

  useEffect(() => {
      fetchPaths()
      fetchStats()
      const interval = setInterval(fetchStats, 5000)
      return () => clearInterval(interval)
  }, [])

  const handleAddPath = async () => {
    if (!path) return
    setScanning(true)
    setMessage("")
    try {
      await api.post("/scan-paths/", { path })
      setMessage("Path added & scan started! Check Job Queue.")
      setPath("")
      fetchPaths()
    } catch (error: any) {
      setMessage("Failed to add path. " + (error.response?.data?.detail || ""))
    } finally {
      setScanning(false)
    }
  }

  const handleStartOCR = async () => {
    setOcrRunning(true)
    setMessage("")
    try {
        await api.post("/images/process-ocr")
        setMessage("OCR Batch started! Check Job Queue.")
    } catch (error: any) {
        setMessage("Failed to start OCR.")
    } finally {
        setOcrRunning(false)
    }
  }

  const handleDeletePath = async (id: number) => {
      if(!confirm("Are you sure? This will remove all images associated with this path from the library.")) return;
      try {
          await api.delete(`/scan-paths/${id}`)
          fetchPaths()
      } catch (e) {
          console.error(e)
      }
  }

  const handleSelectFolder = () => {
    setShowExplorer(!showExplorer)
    if (!showExplorer && !currentDir) {
        fetchDir(explorerPath)
    }
  }

  const handleSelectDir = (p: string) => {
    setPath(p)
    setShowExplorer(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        {/* OCR Management */}
        <Card>
            <CardHeader>
                <CardTitle>AI Processing</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">OCR Text Extraction</h3>
                        <p className="text-sm text-muted-foreground">
                            {stats ? (
                                <>
                                    <span>Total Images: {stats.total_images}</span>
                                    <span className="mx-2">•</span>
                                    <span className={stats.pending_ocr > 0 ? "text-yellow-500 font-bold" : "text-green-500"}>
                                        Pending OCR: {stats.pending_ocr}
                                    </span>
                                </>
                            ) : "Loading stats..."}
                        </p>
                    </div>
                    <Button onClick={handleStartOCR} disabled={ocrRunning || (stats?.pending_ocr === 0)}>
                        <FileText className="mr-2 h-4 w-4" />
                        {ocrRunning ? "Starting..." : "Start OCR Processing"}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Library Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Add New Path */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Add Scan Directory
              </label>
              <p className="text-sm text-muted-foreground">
                Select a folder on the server to scan for images.
              </p>
              <div className="flex w-full max-w-lg items-center space-x-2">
                <div className="relative flex-1">
                    <Input 
                        type="text" 
                        placeholder="/path/to/images" 
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="pr-10"
                    />
                    <button 
                        onClick={handleSelectFolder}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title="Browse Server Folders"
                    >
                        <FolderSearch className="h-4 w-4" />
                    </button>
                </div>
                <Button onClick={handleAddPath} disabled={scanning}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {scanning ? "Scanning..." : "Add Path"}
                </Button>
              </div>

              {showExplorer && currentDir && (
                <div className="mt-4 border rounded-lg bg-muted/30 overflow-hidden max-w-lg animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-muted border-b flex items-center justify-between">
                        <span className="text-xs font-mono truncate max-w-[80%]">{explorerPath}</span>
                        <Button variant="ghost" size="sm" onClick={() => fetchDir(currentDir.parent_path)} className="h-7 px-2">
                            <ChevronLeft className="h-3 w-3 mr-1" />
                            Up
                        </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {currentDir.items.map((item) => (
                            <div 
                                key={item.path} 
                                className="flex items-center justify-between p-2 hover:bg-primary/5 rounded cursor-pointer group"
                                onClick={() => fetchDir(item.path)}
                            >
                                <div className="flex items-center text-sm">
                                    <FolderSearch className="h-3.5 w-3.5 mr-2 text-primary/50" />
                                    <span>{item.name}</span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelectDir(item.path)
                                    }}
                                >
                                    Select
                                </Button>
                            </div>
                        ))}
                        {currentDir.items.length === 0 && (
                            <div className="p-4 text-center text-xs text-muted-foreground italic">No subdirectories found.</div>
                        )}
                    </div>
                    <div className="p-2 border-t flex justify-end">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleSelectDir(currentDir.current_path)}
                        >
                            Select Current Folder
                        </Button>
                    </div>
                </div>
              )}

              {message && (
                <p className="text-sm text-blue-500">{message}</p>
              )}
            </div>

            {/* List Paths */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Configured Paths</h3>
                <div className="border rounded-md divide-y">
                    {paths.map(p => (
                        <div key={p.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-mono">{p.path}</span>
                                <span className="text-xs text-muted-foreground">Added: {new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePath(p.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {paths.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No paths configured.
                        </div>
                    )}
                </div>
            </div>

          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle>About</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
               Immagic v0.1.0 - Production Ready Image Management
             </p>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
