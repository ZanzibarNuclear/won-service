/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [x: string]: JsonValue | undefined;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Achievements {
  description: string | null;
  id: Generated<number>;
  karma_value: Generated<number>;
  name: string;
}

export interface Courses {
  archived_at: Timestamp | null;
  cover_art: string | null;
  created_at: Generated<Timestamp>;
  description: string | null;
  id: Generated<number>;
  public_key: string;
  published_at: Timestamp | null;
  syllabus: string | null;
  teaser: string | null;
  test_only: boolean | null;
  title: string | null;
}

export interface Events {
  actor_id: string | null;
  created_at: Generated<Timestamp>;
  details: Json;
  id: Generated<number>;
}

export interface FeedbackMessages {
  context: Json;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  message: string;
  user_id: string | null;
}

export interface FluxBoosts {
  created_at: Generated<Timestamp>;
  flux_id: number;
  flux_user_id: number;
}

export interface Fluxes {
  blargy: string | null;
  boost_count: Generated<number>;
  content: string;
  created_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
  flux_user_id: number;
  id: Generated<number>;
  parent_id: number | null;
  reply_count: Generated<number>;
  updated_at: Generated<Timestamp>;
  view_count: Generated<number>;
}

export interface FluxFollowers {
  created_at: Generated<Timestamp>;
  follower_id: number;
  following_id: number;
}

export interface FluxUsers {
  created_at: Generated<Timestamp>;
  digest_frequency: string | null;
  display_name: string;
  email_notifications: Timestamp | null;
  handle: string;
  id: Generated<number>;
  text_notifications: Timestamp | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface FluxViews {
  created_at: Generated<Timestamp>;
  flux_id: number;
  flux_user_id: number | null;
}

export interface Identities {
  access_token: string;
  created_at: Generated<Timestamp>;
  email: Generated<string>;
  id: Generated<string>;
  identity_data: Json;
  last_sign_in_at: Timestamp;
  provider: string;
  provider_id: string;
  refresh_token: string | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface Invitations {
  confirmed_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  delivery_error: string | null;
  id: Generated<number>;
  invitee_email: string;
  invitee_name: string;
  joined_at: Timestamp | null;
  joined_user_id: string | null;
  referral_code: string;
  referred_by_id: string;
  sent_at: Timestamp | null;
  target_feature: string | null;
  unsubscribed_at: Timestamp | null;
}

export interface KarmaAwards {
  achievement_id: number | null;
  created_at: Generated<Timestamp>;
  flux_user_id: number;
  karma_awarded: Generated<number>;
  name: string;
}

export interface LearningBookmarks {
  id: Generated<number>;
  lesson_key: string;
  path_key: string | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface LessonContentParts {
  content: Json;
  id: Generated<number>;
  lesson_content_type: string;
  lesson_key: string;
  public_key: string;
  sequence: number | null;
}

export interface LessonPaths {
  course_key: string | null;
  description: string | null;
  id: Generated<number>;
  name: string | null;
  public_key: string | null;
  trailhead: string | null;
}

export interface LessonPlans {
  archived_at: Timestamp | null;
  course_key: string | null;
  cover_art: string | null;
  created_at: Generated<Timestamp>;
  description: string | null;
  id: Generated<number>;
  objective: string | null;
  public_key: string;
  published_at: Timestamp | null;
  sequence: number | null;
  title: string | null;
}

export interface LessonSteps {
  from: string | null;
  id: Generated<number>;
  lesson_path: string | null;
  teaser: string | null;
  to: string | null;
}

export interface MagicAuth {
  alias: string | null;
  email: string;
  expires_at: Timestamp;
  failed_validation_at: Timestamp | null;
  id: Generated<number>;
  token: string;
  verified_at: Timestamp | null;
}

export interface ObjectionReasons {
  code: string;
  description: string;
}

export interface Profiles {
  avatar_url: string | null;
  bio: string | null;
  created_at: Generated<Timestamp>;
  email: string | null;
  email_verified_at: Timestamp | null;
  full_name: string | null;
  id: Generated<string>;
  join_reason: string | null;
  karma_score: Generated<number>;
  location: string | null;
  nuclear_likes: string | null;
  screen_name: string | null;
  updated_at: Generated<Timestamp>;
  website: string | null;
  x_username: string | null;
}

export interface Unsubscribes {
  created_at: Generated<Timestamp>;
  email: string;
  id: Generated<number>;
}

export interface Users {
  alias: string | null;
  created_at: Generated<Timestamp>;
  email: string;
  id: Generated<string>;
  last_sign_in_at: Timestamp;
  updated_at: Generated<Timestamp>;
}

export interface ViolationReports {
  app_key: string;
  content_key: string;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  message: string | null;
  reasons: string[];
  reported_by: string;
}

export interface DB {
  achievements: Achievements;
  courses: Courses;
  events: Events;
  feedback_messages: FeedbackMessages;
  flux_boosts: FluxBoosts;
  flux_followers: FluxFollowers;
  flux_users: FluxUsers;
  flux_views: FluxViews;
  fluxes: Fluxes;
  identities: Identities;
  invitations: Invitations;
  karma_awards: KarmaAwards;
  learning_bookmarks: LearningBookmarks;
  lesson_content_parts: LessonContentParts;
  lesson_paths: LessonPaths;
  lesson_plans: LessonPlans;
  lesson_steps: LessonSteps;
  magic_auth: MagicAuth;
  objection_reasons: ObjectionReasons;
  profiles: Profiles;
  unsubscribes: Unsubscribes;
  users: Users;
  violation_reports: ViolationReports;
}
