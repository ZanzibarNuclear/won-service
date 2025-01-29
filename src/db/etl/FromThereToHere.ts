import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

// Source database
// postgresql://postgres.qlsterztewdwczpxljzz:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
const sourceDb = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.SUPABASE_URL,
    }),
  }),
});

// Target database
const targetDb = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});


// == sample ETL
const loadCourses = async () => {

  // const sourceData = await sourceDb
  //   .selectFrom('courses')
  //   .selectAll()
  //   .execute();

  // const transformedData = sourceData.map((row) => ({
  //   target_column1: row.source_column1.toUpperCase(),
  //   target_column2: row.source_column2 || 'default_value',
  // }));

  // await targetDb
  //   .insertInto('target_table')
  //   .values(transformedData)
  //   .execute();

}


// == migration script
