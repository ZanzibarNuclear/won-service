import { Kysely, Generated } from 'kysely'
import { DB as Database } from '../../../db/types'

// Database interface for type safety
// interface UserTable {
//   id: Generated<string>  // UUID generated by PostgreSQL
//   name: string
//   email: string
//   age: number | null
//   created_at: Generated<Date>
//   updated_at: Generated<Date>
// }

// interface Database {
//   users: UserTable
// }

export class UserRepository {
  constructor(private db: Kysely<Database>) { }

  async findById(id: string): Promise<Users | undefined> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToUser(result)
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToUser(result)
  }

  async create(userData: CreateUser): Promise<User> {
    const result = await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        email: userData.email,
        age: userData.age ?? null,
      })
      .returning('*')
      .executeTakeFirstOrThrow()

    return this.mapToUser(result)
  }

  async update(id: string, userData: CreateUser): Promise<User> {
    const result = await this.db
      .updateTable('users')
      .set({
        name: userData.name,
        email: userData.email,
        age: userData.age ?? null,
        updated_at: new Date(), // Force update timestamp
      })
      .where('id', '=', id)
      .returning('*')
      .executeTakeFirstOrThrow()

    return this.mapToUser(result)
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .execute()
  }

  // Helper method to map database record to domain model
  private mapToUser(record: UserTable): User {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      age: record.age ?? undefined,
    }
  }
}

// SQL migration for creating the users table
export const createUsersTableSQL = `
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX users_email_idx ON users(email);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`

// Database connection configuration
export const createDbConnection = () => {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 10,
      }),
    }),
  })

  return db
}