export interface Session {
  userId: string
  alias: string | null
  roles: string[] | null
}

export interface UserCredentials {
  sub: string
  name: string | null
  role: string[] | null
}

export interface Profile {
  id: string
  alias: string | null
  handle: string | null
  fullName: string | null
  avatar: string | null
  glamShot: string | null
  bio: string | null
  location: string | null
  website: string | null
  whyJoined: string | null
  whyNuclear: string | null
  karmaScore: number
  createdAt: Date
  updatedAt: Date | null
}

export interface ProfileUpdate {
  alias?: string | null
  handle?: string | null
  fullName?: string | null
  avatar?: string | null
  glamShot?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  whyJoined?: string | null
  whyNuclear?: string | null
}

export interface Flux {
  id: number
  authorId: number
  replyTo: number | null
  content: string
  views: number
  boosts: number
  reactions: number
  postedAt: string
  updatedAt: string
  deletedAt: string
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
  order?: 'hottest' | 'oldest' | 'newest'
  authorId?: number
  fluxId?: number
  from?: string
  after?: string
  to?: string
}
