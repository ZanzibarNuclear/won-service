create table
  public.flux_boosts (
    id serial not null,
    flux_id integer not null,
    flux_user_id integer not null,
    created_at timestamp with time zone null default current_timestamp,
    constraint flux_boosts_pkey primary key (id),
    constraint flux_boosts_flux_id_flux_user_id_key unique (flux_id, flux_user_id),
    constraint flux_boosts_flux_id_fkey foreign key (flux_id) references fluxes (id) on delete cascade,
    constraint flux_boosts_flux_user_id_fkey foreign key (flux_user_id) references flux_users (id) on delete cascade
  ) tablespace pg_default;