export type StudyProfileType = "Visual" | "Auditivo" | "Kinestesico"

export interface TopicContent {
  version: "1.0"
  blocks: ContentBlock[]
}

export type ContentBlock = TextBlock | ImageBlock | VideoBlock | QuizBlock

export interface BaseBlock {
  id: string
  profiles: StudyProfileType[]
}

export interface TextBlock extends BaseBlock {
  type: "text"
  content: string // HTML or Markdown
}

export interface ImageBlock extends BaseBlock {
  type: "image"
  url: string
  caption?: string
  altText?: string
}

export interface VideoBlock extends BaseBlock {
  type: "video"
  youtubeId: string
  title?: string
}

export interface QuizBlock extends BaseBlock {
  type: "quiz"
  questionId: string // References Question.id
}
