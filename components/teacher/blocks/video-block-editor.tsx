"use client"

import { VideoBlock } from "@/types/content"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video } from "lucide-react"

interface VideoBlockEditorProps {
  block: VideoBlock
  onChange: (block: VideoBlock) => void
}

// Simple YouTube URL parser to extract ID
function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export function VideoBlockEditor({ block, onChange }: VideoBlockEditorProps) {
  const handleUrlChange = (url: string) => {
    const youtubeId = extractYouTubeId(url)
    onChange({ ...block, youtubeId: youtubeId || url }) // if parsing fails, store url temporarily so user can edit
  }

  // derive display URL
  const displayUrl = block.youtubeId && block.youtubeId.length === 11 
    ? `https://www.youtube.com/watch?v=${block.youtubeId}` 
    : block.youtubeId

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`youtube-${block.id}`}>URL de YouTube</Label>
            <Input
              id={`youtube-${block.id}`}
              placeholder="https://www.youtube.com/watch?v=..."
              value={displayUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`title-${block.id}`}>Título del video (Opcional)</Label>
            <Input
              id={`title-${block.id}`}
              placeholder="Ej: Explicación de derivadas"
              value={block.title || ""}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
          </div>
        </div>
        
        {/* Preview */}
        <div className="w-1/3 aspect-video border rounded-md bg-muted/20 flex flex-col items-center justify-center overflow-hidden relative">
          {block.youtubeId && block.youtubeId.length === 11 ? (
             <iframe
               width="100%"
               height="100%"
               src={`https://www.youtube.com/embed/${block.youtubeId}`}
               title="YouTube video player"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
               className="absolute inset-0"
             ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Video className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-xs">Sin vista previa válida</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
