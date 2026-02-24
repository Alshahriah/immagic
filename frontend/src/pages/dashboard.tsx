import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Lightbox } from "@/components/lightbox"
import { useSearchParams } from "react-router-dom"
import { useAuthStore } from "@/lib/store"

interface Image {
  id: number
  filename: string
  path: string
  thumbnail_path?: string
  ocr_text?: string
}

export function Dashboard() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [searchParams] = useSearchParams()
  const q = searchParams.get("q")
  const token = useAuthStore((state) => state.token)

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

  // Helper to get authorized image URL (this is a simple trick, 
  // ideally we use a signed URL or pass auth token in img request if possible, 
  // but standard <img> tags don't support headers easily.
  // For this local app, we'll assume the browser cookie/session or just append token if needed,
  // BUT we are using JWT in header. 
  // Workaround: We can use a blob URL by fetching with axios, OR assume the image endpoint allows query param auth.
  // Let's implement a simple fetch-to-blob component or just use the URL directly if we allow public access or query param token.
  // We'll update backend to allow query param token for images? Or just fetch blob.
  // Fetching blob is safer.
  
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading images...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
            {q ? `Search Results: "${q}"` : "Photos"}
        </h1>
        <div className="text-sm text-muted-foreground">{images.length} result(s)</div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedImage(image)}
          >
             <div className="aspect-square bg-muted relative">
                <AuthenticatedImage 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/images/${image.id}/file`}
                    alt={image.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
             </div>
          </Card>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No images found.
          </div>
        )}
      </div>

      {selectedImage && (
        <Lightbox 
            image={selectedImage} 
            onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  )
}

// Simple component to fetch image with Auth header and render
function AuthenticatedImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        api.get(src, { responseType: 'blob' })
           .then(response => {
               if (active) {
                   const url = URL.createObjectURL(response.data)
                   setObjectUrl(url)
               }
           })
           .catch(() => {}) // Handle error silently or show placeholder
        
        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [src])

    if (!objectUrl) return <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground p-2 break-all">{alt}</div>

    return <img src={objectUrl} alt={alt} className={className} loading="lazy" />
}
