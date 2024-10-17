create table
  auth.one_time_tokens (
    id uuid not null,
    user_id uuid not null,
    token_type auth.one_time_token_type not null,
    token_hash text not null,
    relates_to text not null,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now(),
    constraint one_time_tokens_pkey primary key (id),
    constraint one_time_tokens_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint one_time_tokens_token_hash_check check ((char_length(token_hash) > 0))
  ) tablespace pg_default;

create index if not exists one_time_tokens_token_hash_hash_idx on auth.one_time_tokens using hash (token_hash) tablespace pg_default;

create index if not exists one_time_tokens_relates_to_hash_idx on auth.one_time_tokens using hash (relates_to) tablespace pg_default;

create unique index if not exists one_time_tokens_user_id_token_type_key on auth.one_time_tokens using btree (user_id, token_type) tablespace pg_default;