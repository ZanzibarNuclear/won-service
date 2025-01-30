import { Timestamp } from '../types';
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('referred_by_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('invitee_name', 'text', (col) => col.notNull())
    .addColumn('invitee_email', 'text', (col) => col.notNull())
    .addColumn('referral_code', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('target_feature', 'text')
    .addColumn('sent_at', 'timestamp')
    .addColumn('delivery_error', 'text')
    .addColumn('confirmed_at', 'timestamp')
    .addColumn('unsubscribed_at', 'timestamp')
    .addColumn('joined_at', 'timestamp')
    .addColumn('joined_user_id', 'uuid', col => col.references('users.id'))
    .execute()

  await db.schema
    .createTable('unsubscribes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('feedback_messages')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('context', 'json', (col) => col.notNull())
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('events')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('actor_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('details', 'json', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('events').ifExists().execute()
  await db.schema.dropTable('feedback_messages').ifExists().execute()
  await db.schema.dropTable('unsubscribes').ifExists().execute()
  await db.schema.dropTable('invitations').ifExists().execute()
}

/*
 * Use cases:
 *
 * # Invitations
 * 
 * 1. Set required fields when user submits invitation form.
 *    Set target_feature to track where the referral was made (e.g., flux, learning, etc.).
 * 2. Set sent_at after email is delivered successfully, 
 *    or delivery_error if there was a problem sending.
 * 3. When recipient clicks link to accept, set confirmed_at.
 * 4. When recipient clicks link to hand-reject, set unsubscribed_at. 
 *    Also, add row to unsubscribes used to scrub outgoing email.
 * 5. When invited user becomes a member, update joined_at and joined_user_id for tracking.
 * 
 * Q: What if someone confirms and unsubscribes? 
 * A: Record both. If they join, great. If not, doesn't matter. 
 *    Don't send unsolicited email in either case.
 * 
 * 
 * # Unsubscribes
 * 
 * 1. Add to list when requested.
 * 2. Filter outgoing email to prevent delivery to unsubscribed addresses.
 * 
 * 
 * # Feedback messages
 * 
 * 1. Known user submits feedback via form. Context can include extra information
 *    about the situation: app in use, nature of feedback, timing, karma snapshot, etc.
 * 
 * 
 * # Events
 * 
 * 1. Capture system-generated event, whatever we want to track. 
 *    Note actor (current user) if known. Can be used to filter someone's activity.
 */