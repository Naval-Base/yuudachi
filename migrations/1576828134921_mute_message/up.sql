
ALTER TABLE "public"."cases" ADD COLUMN "mute_message" text NULL;
COMMENT ON COLUMN "public"."cases"."mute_message" IS E'The id of the message around this mute'
ALTER TABLE "staging"."cases" ADD COLUMN "mute_message" text NULL;
COMMENT ON COLUMN "staging"."cases"."mute_message" IS E'The id of the message around this mute'