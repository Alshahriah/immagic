import { X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface LightboxProps {
  image: {
    id: number
    filename: string
    path: string
    ocr_text?: string
    created_at?: string
  }
  onClose: () => void
}

export function Lightbox({ image, onClose }: LightboxProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
        const src = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/images/${image.id}/file`
        let active = true
        api.get(src, { responseType: 'blob' })
           .then(response => {
               if (active) {
                   const url = URL.createObjectURL(response.data)
                   setObjectUrl(url)
               }
           })
           .catch(() => {}) 
        
        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
  }, [image.id])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 flex gap-2 z-[110]">
         <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-8 w-8" />
         </Button>
      </div>

      <div className="flex w-full h-full">
         {/* Main Image Area */}
         <div className="flex-1 flex items-center justify-center p-8">
            {objectUrl ? (
                <img 
                    src={objectUrl} 
                    alt={image.filename} 
                    className="max-w-full max-h-full object-contain shadow-2xl"
                />
            ) : (
                <div className="text-white text-center">
                    <div className="mb-4 text-4xl animate-pulse">🖼️</div>
                    <p>Loading...</p>
                </div>
            )}
         </div>

         {/* Sidebar Metadata */}
         <div className="w-80 bg-[#1a1a1a] border-l border-white/10 p-6 text-white overflow-y-auto hidden md:block">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Info className="h-4 w-4" /> Info
            </h3>
            
            <div className="space-y-6 text-sm">
                <div>
                    <label className="text-gray-500 uppercase text-xs font-bold block mb-2">Filename</label>
                    <p className="break-all font-mono bg-black/30 p-2 rounded">{image.filename}</p>
                </div>
                
                <div>
                    <label className="text-gray-500 uppercase text-xs font-bold block mb-2">OCR Text</label>
                    <div className="bg-black/30 p-3 rounded-md min-h-[150px] whitespace-pre-wrap font-mono text-xs border border-white/5">
                        {image.ocr_text || <span className="text-gray-600 italic">No text detected.</span>}
                    </div>
                </div>

                <div>
                    <label className="text-gray-500 uppercase text-xs font-bold block mb-2">System Path</label>
                    <p className="break-all text-xs text-gray-400 font-mono">{image.path}</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  )
}
