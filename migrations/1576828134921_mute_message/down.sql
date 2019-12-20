ALTER TABLE "public"."cases" DROP COLUMN "mute_message";
COMMENT ON COLUMN "public"."cases"."mute_message" IS E'null'
ALTER TABLE "staging"."cases" DROP COLUMN "mute_message";
COMMENT ON COLUMN "staging"."cases"."mute_message" IS E'null'
