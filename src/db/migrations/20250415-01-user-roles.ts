import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the roles table
  await db.schema
    .createTable('roles')
    .addColumn('key', 'varchar', (col) => col.primaryKey())
    .addColumn('label', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db
    .insertInto('roles')
    .values([
      {
        key: 'admin',
        label: 'Administrator',
        description: 'Takes care of technical aspects of the platform',
      },
      {
        key: 'support',
        label: 'User Support',
        description: 'Attempts to address and resolve user issues',
      },
      {
        key: 'moderator',
        label: 'Moderator',
        description: 'Oversees content and user adherence with terms of use',
      },
      {
        key: 'member',
        label: 'Member',
        description: 'Able to participate in platform services',
      },
      {
        key: 'user',
        label: 'General User',
        description: 'Anyone using public areas of the platform',
      },
    ])
    .execute()

  // Create the user_roles table
  await db.schema
    .createTable('user_roles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role_id', 'varchar', (col) => col.notNull().references('roles.key').onDelete('cascade'))
    .addColumn('granted_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('user_roles_user_id_role_id_unique', ['user_id', 'role_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_roles').execute();
  await db.schema.dropTable('roles').execute();
}