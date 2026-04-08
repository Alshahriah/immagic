import { useEffect, useState, useMemo } from "react"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Lightbox } from "@/components/lightbox"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Calendar } from "lucide-react"

interface Image {
  id: number
  filename: string
  path: string
  thumbnail_path?: string
  ocr_text?: string
  created_at?: string // Assuming this exists or can be inferred
}

interface GroupedImages {
  date: string
  images: Image[]
}

export function Dashboard() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [searchParams] = useSearchParams()
  const q = searchParams.get("q")

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      try {
        const endpoint = q ? `/images/search/?q=${encodeURIComponent(q)}` : "/images/"
        const { data } = await api.get(endpoint)
        setImages(data)
      } catch (error) {
        console.error("Failed to fetch images", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [q])

  const groupedImages = useMemo(() => {
    const groups: { [key: string]: Image[] } = {}
    
    images.forEach(image => {
      const date = image.created_at ? new Date(image.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Recent'
      
      if (!groups[date]) groups[date] = []
      groups[date].push(image)
    })

    return Object.entries(groups).map(([date, imgs]) => ({
      date,
      images: imgs
    }))
  }, [images])

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10 py-6 -mx-4 px-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
              {q ? `Search Results` : "Photos"}
          </h1>
          {q && <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Search className="w-3.5 h-3.5" /> Showing results for "{q}"
          </p>}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {images.length} {images.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground animate-in fade-in duration-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your library...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedImages.map((group) => (
            <section key={group.date} className="space-y-4">
              <div className="flex items-center gap-4 sticky top-24 z-10 bg-background/80 backdrop-blur-md py-2">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{group.date}</h2>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 md:gap-2"
              >
                <AnimatePresence>
                  {group.images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className="group relative aspect-square overflow-hidden bg-muted cursor-pointer ring-0 hover:ring-4 ring-primary/20 transition-all duration-300"
                        onClick={() => setSelectedImage(image)}
                      >
                        <AuthenticatedImage 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/images/${image.id}/file`}
                          alt={image.filename}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          ))}
          
          {images.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">No images found</h3>
                <p className="text-muted-foreground max-w-xs">
                  We couldn't find any images matching your criteria.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {selectedImage && (
        <Lightbox 
            image={selectedImage} 
            onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  )
}

function AuthenticatedImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
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
    }, [src])

    if (!objectUrl) return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
      </div>
    )

    return (
      <img 
        src={objectUrl} 
        alt={alt} 
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} 
        onLoad={() => setIsLoaded(true)}
        loading="lazy" 
      />
    )
}
