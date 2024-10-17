create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function handle_new_user ();
