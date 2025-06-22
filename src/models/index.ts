import { z } from 'zod'

export const CampaignSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
})

export const PlayerSchema = z.object({
  name: z.string(),
  level: z.number().int().min(1),
  inventory: z.array(z.string()).optional(),
})

export const ItemSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.number().optional(),
  description: z.string().optional(),
})

export const AreaSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  rooms: z.array(z.string()).optional(),
})

export const RoomSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  area: z.string().optional(),
})

export const NpcSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
})

export const EventSchema = z.object({
  name: z.string(),
  type: z.string(),
  timestamp: z.date().optional(),
})

export type Campaign = z.infer<typeof CampaignSchema>
export type Player = z.infer<typeof PlayerSchema>
export type Item = z.infer<typeof ItemSchema>
export type Area = z.infer<typeof AreaSchema>
export type Room = z.infer<typeof RoomSchema>
export type Npc = z.infer<typeof NpcSchema>
export type Event = z.infer<typeof EventSchema>
