import { Card, CardContent } from "@/components/ui/card"

export function ExplorePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
      <p className="text-muted-foreground">Discover trending photos and smart albums (Coming Soon).</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["Nature", "Architecture", "People", "Travel", "Food", "Animals"].map((category) => (
            <Card key={category} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-6 flex items-center justify-center h-32">
                    <span className="text-xl font-semibold">{category}</span>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
