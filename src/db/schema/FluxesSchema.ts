import { z } from "zod";

export const FluxesSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  fluxUserId: z.string(),
  parentId: z.string().nullable(),
  replyCount: z.number().default(0),
  boostCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export type Fluxes = z.infer<typeof FluxesSchema>;