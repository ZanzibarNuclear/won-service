create table
  public.fluxes (
    id serial not null,
    content text not null,
    flux_user_id integer not null,
    parent_id integer null,
    reply_count integer null default 0,
    boost_count integer null default 0,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    deleted_at timestamp with time zone null default current_timestamp,
    constraint fluxes_pkey primary key (id),
    constraint fluxes_flux_user_id_fkey foreign key (flux_user_id) references flux_users (id) on delete cascade,
    constraint fluxes_parent_id_fkey foreign key (parent_id) references fluxes (id) on delete set null
  ) tablespace pg_default;