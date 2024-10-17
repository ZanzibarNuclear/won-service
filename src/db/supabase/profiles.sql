create table
  public.profiles (
    id uuid not null,
    username text not null,
    screen_name text null,
    full_name text null,
    avatar_url text null,
    bio text null,
    location text null,
    join_reason text null,
    nuclear_likes text null,
    x_username text null,
    website text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint profiles_pkey primary key (id),
    constraint profiles_username_key unique (username),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint username_length check ((char_length(username) >= 3))
  ) tablespace pg_default;