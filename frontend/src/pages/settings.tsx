import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trash2, FolderPlus, FileText } from "lucide-react"

interface ScanPath {
    id: number
    path: string
    created_at: string
}

interface Stats {
    total_images: number
    pending_ocr: number
}

export function SettingsPage() {
  const [path, setPath] = useState("")
  const [scanning, setScanning] = useState(false)
  const [ocrRunning, setOcrRunning] = useState(false)
  const [message, setMessage] = useState("")
  const [paths, setPaths] = useState<ScanPath[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

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
                Enter the absolute path to a folder on the server.
              </p>
              <div className="flex w-full max-w-lg items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="/path/to/images" 
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                />
                <Button onClick={handleAddPath} disabled={scanning}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {scanning ? "Scanning..." : "Add Path"}
                </Button>
              </div>
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
