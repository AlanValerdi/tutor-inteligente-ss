"use client"

import { ImageBlock } from "@/types/content"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon } from "lucide-react"

interface ImageBlockEditorProps {
  block: ImageBlock
  onChange: (block: ImageBlock) => void
}

export function ImageBlockEditor({ block, onChange }: ImageBlockEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`url-${block.id}`}>URL de la imagen (Link externo por ahora)</Label>
            <Input
              id={`url-${block.id}`}
              placeholder="https://ejemplo.com/imagen.jpg"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`alt-${block.id}`}>Texto alternativo (Alt)</Label>
            <Input
              id={`alt-${block.id}`}
              placeholder="Descripción de la imagen"
              value={block.altText || ""}
              onChange={(e) => onChange({ ...block, altText: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`caption-${block.id}`}>Pie de foto (Opcional)</Label>
            <Input
              id={`caption-${block.id}`}
              placeholder="Ej: Figura 1. Estructura de la célula"
              value={block.caption || ""}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
            />
          </div>
        </div>
        
        {/* Preview */}
        <div className="w-1/3 min-h-[150px] border rounded-md bg-muted/20 flex flex-col items-center justify-center overflow-hidden">
          {block.url ? (
            <img src={block.url} alt={block.altText || "Preview"} className="max-w-full max-h-[200px] object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-xs">Sin vista previa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
