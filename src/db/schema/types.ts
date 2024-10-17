/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string>;

export interface FluxBoosts {
  created_at: Generated<Timestamp>;
  flux_id: number;
  flux_user_id: number;
  id: Generated<number>;
}

export interface Fluxes {
  id: Generated<number>;
  content: string;
  flux_user_id: number;
  parent_id: number | null;
  reply_count: Generated<number | null>;
  boost_count: Generated<number | null>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface FluxUsers {
  avatar_url: string | null;
  bio: string | null;
  created_at: Generated<Timestamp>;
  display_name: string;
  handle: string;
  id: Generated<number>;
  location: string | null;
  user_id: string;
  website: string | null;
}

export interface Teams {
  id: Generated<number>;
  name: string;
}

export interface Users {
  email: string;
  family_name: string;
  given_name: string;
  id: Generated<string>;
}

export interface DB {
  flux_boosts: FluxBoosts;
  flux_users: FluxUsers;
  fluxes: Fluxes;
  teams: Teams;
  users: Users;
}
