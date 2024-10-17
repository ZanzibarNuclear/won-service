create table
  auth.identities (
    provider_id text not null,
    user_id uuid not null,
    identity_data jsonb not null,
    provider text not null,
    last_sign_in_at timestamp with time zone null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    email text generated always as (lower((identity_data ->> 'email'::text))) stored null,
    id uuid not null default gen_random_uuid (),
    constraint identities_pkey primary key (id),
    constraint identities_provider_id_provider_unique unique (provider_id, provider),
    constraint identities_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists identities_email_idx on auth.identities using btree (email text_pattern_ops) tablespace pg_default;

create index if not exists identities_user_id_idx on auth.identities using btree (user_id) tablespace pg_default;