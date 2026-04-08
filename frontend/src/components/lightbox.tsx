import { useEffect, useState } from "react"
import { X, ZoomIn, ZoomOut, Download, Info, Calendar, MapPin, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import api from "@/lib/api"

interface Image {
  id: number
  filename: string
  path: string
  ocr_text?: string
}

interface LightboxProps {
  image: Image
  onClose: () => void
}

export function Lightbox({ image, onClose }: LightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const src = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/images/${image.id}/file`
    
    api.get(src, { responseType: 'blob' })
       .then(response => {
           if (active) {
               const url = URL.createObjectURL(response.data)
               setObjectUrl(url)
           }
       })
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
        active = false
        window.removeEventListener("keydown", handleEsc)
        if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [image.id])

  const handleDownload = () => {
    if (!objectUrl) return
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
      >
        {/* Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[110] bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full h-12 w-12 transition-transform active:scale-95">
               <X className="w-6 h-6" />
             </Button>
             <div className="hidden md:block">
               <p className="text-white font-medium truncate max-w-[200px] text-shadow-sm">{image.filename}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))} className="text-white hover:bg-white/10">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))} className="text-white hover:bg-white/10">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10">
              <Download className="w-5 h-5" />
            </Button>
            <Button 
                variant={showInfo ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setShowInfo(!showInfo)} 
                className={showInfo ? "rounded-full" : "text-white hover:bg-white/10"}
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: zoom, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative max-w-[90%] max-h-[90%] flex items-center justify-center"
          >
            {objectUrl ? (
                <img 
                    src={objectUrl} 
                    alt={image.filename} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm ring-1 ring-white/10"
                />
            ) : (
                <div className="flex flex-col items-center gap-4 text-white/50">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-sm font-medium tracking-wide">FETCHING ASSETS</p>
                </div>
            )}
          </motion.div>
        </div>

        {/* Info Sidebar */}
        <AnimatePresence>
            {showInfo && (
                <motion.div 
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-background/80 backdrop-blur-2xl border-l z-[120] shadow-2xl p-8 overflow-y-auto"
                >
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Information</h2>
                        <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)} className="rounded-full">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-10">
                        <section className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Properties</h3>
                            <div className="grid gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">Filename</p>
                                        <p className="text-sm font-semibold truncate leading-none py-1">{image.filename}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">System Path</p>
                                        <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{image.path}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Intelligence Output</h3>
                            <div className="group relative">
                                <div className="absolute -inset-2 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-5 rounded-2xl bg-muted/40 border border-border/40 min-h-[160px] max-h-[400px] overflow-y-auto scrollbar-thin">
                                    {image.ocr_text ? (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/80">{image.ocr_text}</p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                                            <p className="text-sm text-muted-foreground/60 italic px-8">
                                                No intelligence data extracted yet. 
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                        
                        <div className="pt-6">
                            <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleDownload}>
                                <Download className="w-5 h-5 mr-2" />
                                Download Original
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Close on Background Click */}
        <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      </motion.div>
    </AnimatePresence>
  )
}
