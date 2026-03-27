import { ContentBlock, TopicContent } from "@/types/content"
import { filterBlocksByProfile } from "@/lib/content-helpers"
import { InlineQuizBlock } from "./blocks/inline-quiz-block"

interface TopicContentViewerProps {
  content: TopicContent
  profile: string
}

export function TopicContentViewer({ content, profile }: TopicContentViewerProps) {
  // Safe default for blocks in case content or content.blocks is undefined
  const rawBlocks = content?.blocks && Array.isArray(content.blocks) ? content.blocks : []
  const blocks = filterBlocksByProfile(rawBlocks, profile)

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      {(!blocks || blocks.length === 0) && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          <h3 className="font-bold mb-2">No hay bloques para mostrar</h3>
          <p className="text-sm">Perfil actual: <strong>{String(profile)}</strong></p>
          <div className="mt-4 p-2 bg-black/5 rounded text-xs overflow-auto">
            <strong>Debug Raw Content:</strong>
            <pre className="mt-1">{JSON.stringify({ 
              receivedContentType: typeof content,
              isArray: Array.isArray(content),
              contentFullData: content
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {blocks.map((block: any) => {
        switch (block.type) {
          case "text":
            return (
              <div
                key={block.id}
                className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )
          case "image":
            return (
              <figure key={block.id} className="my-8">
                <img
                  src={block.url}
                  alt={block.altText || ""}
                  className="w-full rounded-xl shadow-sm object-cover max-h-[500px]"
                />
                {block.caption && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-3">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case "video":
            return (
              <div key={block.id} className="my-8">
                {block.title && <h3 className="text-lg font-semibold mb-3">{block.title}</h3>}
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
                  {block.youtubeId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${block.youtubeId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">Video no disponible</span>
                    </div>
                  )}
                </div>
              </div>
            )
          case "quiz":
            return <InlineQuizBlock key={block.id} questionId={block.questionId} />
          default:
            return (
              <div key={block.id} className="p-4 bg-yellow-50 text-yellow-600 rounded">
                Bloque no soportado: {block.type}
              </div>
            )
        }
      })}
    </div>
  )
}
