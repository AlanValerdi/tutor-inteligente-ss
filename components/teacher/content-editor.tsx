"use client"

import { ContentBlock, StudyProfileType } from "@/types/content"
import { TextBlockEditor } from "./blocks/text-block-editor"
import { ImageBlockEditor } from "./blocks/image-block-editor"
import { VideoBlockEditor } from "./blocks/video-block-editor"
import { QuizBlockEditor } from "./blocks/quiz-block-editor"
import { Button } from "@/components/ui/button"
import { GripVertical, Trash2, Plus, Image as ImageIcon, Video, FileQuestion, Type } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ContentEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

function SortableBlockItem({
  block,
  onChange,
  onRemove,
}: {
  block: ContentBlock
  onChange: (block: ContentBlock) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  const handleProfileToggle = (profile: StudyProfileType) => {
    const profiles = block.profiles.includes(profile)
      ? block.profiles.filter(p => p !== profile)
      : [...block.profiles, profile]
    onChange({ ...block, profiles })
  }

  const renderBlockEditor = () => {
    switch (block.type) {
      case "text":
        return <TextBlockEditor block={block as any} onChange={onChange as any} />
      case "image":
        return <ImageBlockEditor block={block as any} onChange={onChange as any} />
      case "video":
        return <VideoBlockEditor block={block as any} onChange={onChange as any} />
      case "quiz":
        return <QuizBlockEditor block={block as any} onChange={onChange as any} />
      default:
        return <div>Tipo de bloque no soportado</div>
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group rounded-lg border bg-card/50 shadow-sm mb-4">
      <div className="flex items-center justify-between border-b p-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium uppercase text-muted-foreground">{block.type}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {(['Visual', 'Auditivo', 'Kinestesico'] as StudyProfileType[]).map((profile) => (
              <div key={profile} className="flex items-center space-x-1">
                <Checkbox
                  id={`profile-${block.id}-${profile}`}
                  checked={block.profiles.includes(profile)}
                  onCheckedChange={() => handleProfileToggle(profile)}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`profile-${block.id}-${profile}`}
                  className="text-xs text-muted-foreground font-normal cursor-pointer"
                >
                  {profile.substring(0, 3)}
                </Label>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3">
        {renderBlockEditor()}
      </div>
    </div>
  )
}

export function ContentEditor({ blocks, onChange }: ContentEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      profiles: ["Visual", "Auditivo", "Kinestesico"],
      ...(type === "text" && { content: "" }),
      ...(type === "image" && { url: "" }),
      ...(type === "video" && { youtubeId: "" }),
      ...(type === "quiz" && { questionId: "" }),
    } as any

    onChange([...blocks, newBlock])
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              onChange={(updatedBlock) => {
                onChange(blocks.map((b) => (b.id === block.id ? updatedBlock : b)))
              }}
              onRemove={() => {
                onChange(blocks.filter((b) => b.id !== block.id))
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
        <span className="text-sm font-medium text-muted-foreground w-full mb-1">Añadir bloque:</span>
        <Button variant="outline" size="sm" onClick={() => addBlock("text")} className="gap-2">
          <Type className="h-4 w-4" /> Texto
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("image")} className="gap-2">
          <ImageIcon className="h-4 w-4" /> Imagen
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("video")} className="gap-2">
          <Video className="h-4 w-4" /> Video
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("quiz")} className="gap-2">
          <FileQuestion className="h-4 w-4" /> Quiz Inline
        </Button>
      </div>
    </div>
  )
}
