CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.cases (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    guild text NOT NULL,
    message text,
    case_id integer NOT NULL,
    ref_id integer,
    target_id text NOT NULL,
    target_tag text NOT NULL,
    mod_id text,
    mod_tag text,
    action integer NOT NULL,
    reason text,
    action_duration timestamp with time zone,
    action_processed boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    mute_message text
);
COMMENT ON COLUMN public.cases.guild IS 'The id of the guild this case belongs to';
COMMENT ON COLUMN public.cases.message IS 'The id of the message this case belongs to';
COMMENT ON COLUMN public.cases.case_id IS 'The case id';
COMMENT ON COLUMN public.cases.ref_id IS 'The id of the case this case references';
COMMENT ON COLUMN public.cases.target_id IS 'The id of the target this case belongs to';
COMMENT ON COLUMN public.cases.target_tag IS 'The tag of the target this case belongs to';
COMMENT ON COLUMN public.cases.mod_id IS 'The id of the moderator this case belongs to';
COMMENT ON COLUMN public.cases.mod_tag IS 'The tag of the moderator this case belongs to';
COMMENT ON COLUMN public.cases.action IS 'The action of this case';
COMMENT ON COLUMN public.cases.reason IS 'The reason of this case';
COMMENT ON COLUMN public.cases.action_duration IS 'The duration of this case';
COMMENT ON COLUMN public.cases.action_processed IS 'Whether this case has been processed or not';
COMMENT ON COLUMN public.cases.mute_message IS 'The id of the message around this mute';
CREATE TABLE public.lockdowns (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    guild text NOT NULL,
    channel text NOT NULL,
    duration timestamp with time zone NOT NULL
);
COMMENT ON COLUMN public.lockdowns.guild IS 'The id of the guild this lockdown belongs to';
COMMENT ON COLUMN public.lockdowns.channel IS 'The id of the channel this lockdown belongs to';
COMMENT ON COLUMN public.lockdowns.duration IS 'The duration of the lockdown';
CREATE TABLE public.role_states (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    guild text NOT NULL,
    member text NOT NULL,
    roles text[] DEFAULT '{}'::text[] NOT NULL
);
COMMENT ON COLUMN public.role_states.guild IS 'The id of the guild this role state belongs to';
COMMENT ON COLUMN public.role_states.member IS 'The id of the member this role state belongs to';
COMMENT ON COLUMN public.role_states.roles IS 'The roles of this role state';
CREATE TABLE public.settings (
    guild text NOT NULL,
    settings jsonb DEFAULT jsonb_build_object() NOT NULL
);
COMMENT ON COLUMN public.settings.guild IS 'The id of the guild this setting belongs to';
CREATE TABLE public.tags (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    guild text NOT NULL,
    "user" text NOT NULL,
    name text NOT NULL,
    aliases text[] DEFAULT '{}'::text[] NOT NULL,
    content text NOT NULL,
    hoisted boolean DEFAULT false,
    uses integer DEFAULT 0 NOT NULL,
    last_modified text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    templated boolean DEFAULT false NOT NULL
);
COMMENT ON COLUMN public.tags.guild IS 'The id of the guild this tag belongs to';
COMMENT ON COLUMN public.tags."user" IS 'The id of the user this tag belongs to';
COMMENT ON COLUMN public.tags.hoisted IS 'Whether the tag is a hoisted guild tag or not';
COMMENT ON COLUMN public.tags.last_modified IS 'The id of the user who last modified this tag';
COMMENT ON COLUMN public.tags.templated IS 'Whether the tag is templated or not';
ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lockdowns
    ADD CONSTRAINT lockdowns_guild_channel_key UNIQUE (guild, channel);
ALTER TABLE ONLY public.lockdowns
    ADD CONSTRAINT lockdowns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.role_states
    ADD CONSTRAINT role_states_guild_member_key UNIQUE (guild, member);
ALTER TABLE ONLY public.role_states
    ADD CONSTRAINT role_states_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_guild_key UNIQUE (guild);
ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (guild);
ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_guild_name_key UNIQUE (guild, name);
ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
CREATE TRIGGER set_public_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_tags_updated_at ON public.tags IS 'trigger to set value of column "updated_at" to current timestamp on row update';
