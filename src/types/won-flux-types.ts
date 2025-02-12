export interface Session {
  userId: string
  alias: string | null
  roles: string[] | null
}

export interface Flux {
  id: number
  author: string
  authorUsername: string
  authorAvatar: string
  replyTo: number | null
  content: string
  timestamp: string
  viewCount: number
  replyCount: number
  boostCount: number
  boosted: boolean
}

export interface FluxResponse {
  items: Flux[]
  total: number
  hasMore: boolean
}

export interface Course {
  archivedAt: Date | null
  coverArt: string | null
  createdAt: Date | null
  description: string | null
  id: number
  publicKey: string
  publishedAt: Date | null
  syllabus: string | null
  teaser: string | null
  testOnly: boolean | null
  title: string | null
}