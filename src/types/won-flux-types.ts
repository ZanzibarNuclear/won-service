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

export interface FluxFilter {
  order?: string
  authorId?: number
  fluxId?: number
}

export interface Profile {
  avatarUrl: string | null
  bio: string | null
  createdAt: Date
  email: string | null
  emailVerifiedAt: Date | null
  fullName: string | null
  id: string
  joinReason: string | null
  karmaScore: number
  location: string | null
  nuclearLikes: string | null
  screenName: string | null
  updatedAt: Date | null
  website: string | null
  xUsername: string | null
}

export interface ProfileUpdate {
  id: string
  email: string | null
  screenName: string | null
  fullName: string | null
  avatarUrl: string | null
  website: string | null
  bio: string | null
  location: string | null
  joinReason: string | null
  nuclearLikes: string | null
  xUsername: string | null
}
