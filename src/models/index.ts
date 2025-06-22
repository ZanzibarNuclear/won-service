import { z } from 'zod'

// Campaign: tracks game time
export const CampaignSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date(),      // when the campaign started
  currentTime: z.coerce.date(),    // current in-game time
  createdAt: z.date().optional(),
})

export type Campaign = z.infer<typeof CampaignSchema>

// Player: classic characteristics, birthdate, gender, biography, avatar, portrait, inventory
export const PlayerSchema = z.object({
  name: z.string(),
  level: z.number().int().min(1),
  birthdate: z.coerce.date(),
  gender: z.enum(['male', 'female', 'nonbinary', 'other']),
  biography: z.string().optional(),
  avatar: z.string().url().optional(),   // URL to avatar image
  portrait: z.string().url().optional(), // URL to portrait image
  characteristics: z.object({
    strength: z.number().int().min(1).max(20),
    intelligence: z.number().int().min(1).max(20),
    wisdom: z.number().int().min(1).max(20),
    dexterity: z.number().int().min(1).max(20),
    constitution: z.number().int().min(1).max(20),
    charisma: z.number().int().min(1).max(20),
  }),
  inventory: z.array(z.string()).optional(), // array of item IDs
})

export type Player = z.infer<typeof PlayerSchema>

// Item: unchanged for now
export const ItemSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.number().optional(),
  description: z.string().optional(),
  qualities: z.object({
    wearable: z.boolean().optional(),
    edible: z.boolean().optional(),
    poisonous: z.boolean().optional(),
    radioactive: z.boolean().optional(),
    toxic: z.boolean().optional(),
    clean: z.boolean().optional(),
    refreshing: z.boolean().optional(),
  }).optional(),
})

export type Item = z.infer<typeof ItemSchema>

// Area: geographic space, with type
export const AreaSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['terrain', 'building', 'underground', 'bunker', 'lab', 'other']),
  rooms: z.array(z.string()).optional(), // array of room IDs
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
  }).optional(),
  perimeter: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      z: z.number().optional(),
    })
  ).optional(), // array of points defining the perimeter
})

export type Area = z.infer<typeof AreaSchema>

// Room, Npc, Event: unchanged for now
export const RoomSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  area: z.string().optional(),
  level: z.string().optional(), // e.g., "first", "second", "basement 1", etc.
  exits: z.array(
    z.object({
      direction: z.string(), // e.g., "north", "south", "up", "down"
      description: z.string(),
      type: z.enum(['door', 'walkway', 'hallway', 'tunnel', 'outside']),
      to: z.string(),        // room ID or name
    })
  ).optional(),
  features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ).optional(),
  condition: z.object({
    brightness: z.enum(['dark', 'dim', 'normal', 'bright']).optional(),
    airQuality: z.enum(['fresh', 'stale', 'smoky', 'toxic', 'unknown']).optional(),
    noise: z.enum(['silent', 'quiet', 'normal', 'loud', 'deafening']).optional(),
  }).optional(),
})

export type Room = z.infer<typeof RoomSchema>

export const NpcSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
  catchPhrases: z.array(
    z.object({
      phrase: z.string(),
      weight: z.number().min(0).default(1),
    })
  ).optional(),
  items: z.array(z.string()).optional(), // array of item IDs
  characteristics: z.object({
    strength: z.number().int().min(1).max(20).optional(),
    intelligence: z.number().int().min(1).max(20).optional(),
    wisdom: z.number().int().min(1).max(20).optional(),
    dexterity: z.number().int().min(1).max(20).optional(),
    constitution: z.number().int().min(1).max(20).optional(),
    charisma: z.number().int().min(1).max(20).optional(),
  }).optional(),
})

export type Npc = z.infer<typeof NpcSchema>

export const EventSchema = z.object({
  name: z.string(),
  type: z.string(),
  timestamp: z.date().optional(),
})

export type Event = z.infer<typeof EventSchema>

export const TransitionSchema = z.object({
  toSceneId: z.string(),
  condition: z.string().optional(), // e.g., "playerHasKey", or a script reference
})

export type Transition = z.infer<typeof TransitionSchema>

export const ChoiceSchema = z.object({
  text: z.string(),
  transition: TransitionSchema,
})

export type Choice = z.infer<typeof ChoiceSchema>

export const SceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['normal', 'activity', 'final']),
  activityType: z.string().optional(), // e.g., 'video', 'equipment'
  choices: z.array(ChoiceSchema).optional(),
  transitions: z.array(TransitionSchema).optional(),
})

export type Scene = z.infer<typeof SceneSchema>

export const StorylineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  scenes: z.array(SceneSchema),
  startSceneId: z.string(),
})

export type Storyline = z.infer<typeof StorylineSchema>
