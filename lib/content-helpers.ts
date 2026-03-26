import { ContentBlock, TopicContent, StudyProfileType } from "@/types/content"

// Helper to safely parse string to TopicContent
export function parseTopicContent(content: unknown): TopicContent {
  if (!content) {
    return { version: "1.0", blocks: [] }
  }

  // If it's already an object, assume it's JSON from Prisma
  if (typeof content === "object") {
    // Just in case, validate some basic shape or cast directly
    return content as TopicContent
  }

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content)
      return parsed as TopicContent
    } catch (e) {
      // Fallback: If it's just raw string (legacy), wrap it
      return {
        version: "1.0",
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "text",
            content: content,
            profiles: ["Visual", "Auditivo", "Kinestesico"],
          },
        ],
      }
    }
  }

  return { version: "1.0", blocks: [] }
}

export function filterBlocksByProfile(
  blocks: ContentBlock[],
  profile?: string | null
): ContentBlock[] {
  if (!profile) return blocks // Show all if no profile is set
  
  return blocks.filter((block) => 
    block.profiles.length === 0 || block.profiles.includes(profile as StudyProfileType)
  )
}

export function estimateReadingTime(blocks: ContentBlock[]): number {
  let text = ""
  for (const block of blocks) {
    if (block.type === "text") {
      // very naive approach: strip html tags and count words
      const plainText = block.content.replace(/<[^>]*>?/gm, " ")
      text += " " + plainText
    }
  }
  const words = text.trim().split(/\s+/).length
  const wpm = 200
  const minutes = Math.ceil(words / wpm)
  return minutes > 0 ? minutes : 1
}
