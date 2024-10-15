DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REDROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 recordDROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 recDROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, youDROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;DROP TABLE IF EXISTS flux_boosts;
DROP TABLE IF EXISTS fluxes;
DROP TABLE IF EXISTS flux_authors;
DROP TABLE IF EXISTS flux_users;

CREATE TABLE flux_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);
at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);
u can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  handle VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_flux_users_handle ON flux_users(handle);

CREATE TABLE fluxes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  flux_user_id INTEGER NOT NULL,
  parent_id INTEGER,
  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);
n modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  reply_count INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES fluxes(id) ON DELETE SET NULL,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);

CREATE TABLE flux_boosts (
  id SERIAL PRIMARY KEY,
  flux_id INTEGER NOT NULL,
  flux_user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flux_id, flux_user_id),
  FOREIGN KEY (flux_id) REFERENCES fluxes(id) ON DELETE CASCADE,
  FOREIGN KEY (flux_user_id) REFERENCES flux_users(id) ON DELETE CASCADE
);


# Here's a SQL query that fetches the latest up to 10 fluxes, including the author's handle, and provides information for pagination:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
ORDER BY 
  f.created_at DESC
LIMIT 11;

# We use LIMIT 11 instead of 10. This allows us to fetch one extra record, which we can use to determine if there are more records available for the next batch.

# Fetch 11 records.
# If you get 11 records, use only the first 10 for display.
# The existence of the 11th record indicates there are more fluxes available for the next batch.
# Use the created_at value of the 10th record as the starting point for the next query.
# For pagination, you can modify the query to use a cursor-based approach:

SELECT 
  f.id,
  f.content,
  fa.handle AS author_handle,
  f.parent_id,
  f.reply_count,
  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);

  f.boost_count,
  f.created_at,
  f.updated_at
FROM 
  fluxes f
JOIN 
  flux_users fa ON f.author_id = fa.id
WHERE 
  f.deleted_at IS NULL
  AND f.created_at < :last_created_at
ORDER BY 
  f.created_at DESC
LIMIT 11;

# Here is a query to get flux_users for a list of handles:

SELECT 
  id,
  handle,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM 
  flux_users
WHERE 
  handle = ANY($1::varchar[]);

const handles = ['user1', 'user2', 'user3'];
const result = await client.query(
  'SELECT id, handle, display_name, avatar_url, created_at, updated_at FROM flux_users WHERE handle = ANY($1::varchar[])',
  [handles]
);
