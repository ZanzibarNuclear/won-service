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
  archived_at: string | null
  cover_art: string | null
  created_at: string | null
  description: string | null
  id: number
  public_key: string
  published_at: string | null
  syllabus: string | null
  teaser: string | null
  test_only: boolean | null
  title: string | null
}