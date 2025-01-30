import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('courses')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('public_key', 'text', col => col.unique().notNull())
    .addColumn('title', 'text')
    .addColumn('cover_art', 'text')
    .addColumn('teaser', 'text')
    .addColumn('description', 'text')
    .addColumn('syllabus', 'text')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('published_at', 'timestamp')
    .addColumn('archived_at', 'timestamp')
    .addColumn('test_only', 'boolean')
    .execute()

  await db.schema
    .createTable('lesson_plans')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('public_key', 'text', col => col.unique().notNull())
    .addColumn('course_key', 'text', col => col.references('courses.public_key'))
    .addColumn('title', 'text')
    .addColumn('description', 'text')
    .addColumn('objective', 'text')
    .addColumn('cover_art', 'text')
    .addColumn('sequence', 'smallint')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('published_at', 'timestamp')
    .addColumn('archived_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('lesson_content_parts')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('public_key', 'text', col => col.unique().notNull())
    .addColumn('lesson_id', 'bigint', col => col.notNull().references('lesson_plans.id'))
    .addColumn('lesson_content_type', 'text', col => col.notNull())
    .addColumn('content', 'json', col => col.notNull())
    .addColumn('sequence', 'smallint')
    .execute()

  await db.schema
    .createTable('lesson_paths')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('public_key', 'text', col => col.unique())
    .addColumn('course_key', 'text', col => col.references('courses.public_key').onDelete('cascade'))
    .addColumn('name', 'text')
    .addColumn('description', 'text')
    .addColumn('trailhead', 'text', col => col.references('lesson_plans.public_key').onDelete('set null'))
    .execute()

  await db.schema
    .createTable('lesson_steps')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('lesson_path', 'text', col => col.references('lesson_paths.public_key').onDelete('cascade'))
    .addColumn('from', 'text', col => col.references('lesson_plans.public_key').onDelete('set null'))
    .addColumn('to', 'text', col => col.references('lesson_plans.public_key').onDelete('set null'))
    .addColumn('teaser', 'text')
    .execute()

  await db.schema
    .createTable('learning_bookmarks')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'uuid', col => col.notNull().references('users.id'))
    .addColumn('lesson_key', 'text', col => col.notNull().references('lesson_plans.public_key').onDelete('cascade'))
    .addColumn('path_key', 'text', col => col.references('lesson_paths.public_key').onDelete('set null'))
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('learning_bookmarks').ifExists().execute()
  await db.schema.dropTable('lesson_steps').ifExists().execute()
  await db.schema.dropTable('lesson_paths').ifExists().execute()
  await db.schema.dropTable('lesson_content_parts').ifExists().execute()
  await db.schema.dropTable('lesson_plans').ifExists().execute()
  await db.schema.dropTable('courses').ifExists().execute()
}
