create table
  public.flux_users (
    id serial not null,
    user_id uuid not null,
    handle character varying(30) not null,
    display_name character varying(50) not null,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    constraint flux_users_pkey primary key (id),
    constraint flux_users_handle_key unique (handle),
    constraint flux_users_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_flux_users_handle on public.flux_users using btree (handle) tablespace pg_default;