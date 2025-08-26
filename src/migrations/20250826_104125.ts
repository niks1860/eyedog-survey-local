import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_surveys_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_questions_form_elements_type" AS ENUM('text', 'textarea', 'boolean', 'number', 'email', 'select', 'checkbox', 'radio');
  CREATE TYPE "public"."enum_questions_type" AS ENUM('4_image', 'form');
  CREATE TYPE "public"."enum_participants_status" AS ENUM('new', 'in_progress', 'completed', 'abandoned');
  CREATE TABLE "surveys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"instructions" jsonb NOT NULL,
  	"thank_you_message" jsonb NOT NULL,
  	"default_countdown_seconds" numeric DEFAULT 3 NOT NULL,
  	"status" "enum_surveys_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "surveys_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"questions_id" integer
  );
  
  CREATE TABLE "questions_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "questions_form_elements_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "questions_form_elements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_questions_form_elements_type",
  	"name" varchar,
  	"label" varchar,
  	"placeholder" varchar,
  	"default_value" varchar,
  	"required" boolean DEFAULT false,
  	"validation_min_length" numeric,
  	"validation_max_length" numeric,
  	"validation_min" numeric,
  	"validation_max" numeric,
  	"validation_pattern" varchar
  );
  
  CREATE TABLE "questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_questions_type" NOT NULL,
  	"order" numeric NOT NULL,
  	"override_instructions" jsonb,
  	"countdown_seconds" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"participant_id" varchar NOT NULL,
  	"unique_link_token" varchar NOT NULL,
  	"current_survey_id" integer,
  	"last_completed_question_id" integer,
  	"status" "enum_participants_status" DEFAULT 'new' NOT NULL,
  	"metadata" jsonb,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"total_time_ms" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "responses_reselection_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"timestamp_ms" numeric NOT NULL,
  	"selected_option_id" varchar NOT NULL
  );
  
  CREATE TABLE "responses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"participant_id" integer NOT NULL,
  	"survey_id" integer NOT NULL,
  	"question_id" integer NOT NULL,
  	"question_displayed_at" timestamp(3) with time zone NOT NULL,
  	"initial_selection_time_ms" numeric,
  	"final_selection_time_ms" numeric NOT NULL,
  	"selected_option_id" varchar,
  	"form_data" jsonb,
  	"client_timestamp" timestamp(3) with time zone,
  	"server_timestamp" timestamp(3) with time zone,
  	"response_quality_is_valid" boolean DEFAULT true,
  	"response_quality_quality_score" numeric,
  	"response_quality_quality_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "surveys_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "participants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "responses_id" integer;
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_questions_fk" FOREIGN KEY ("questions_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions_images" ADD CONSTRAINT "questions_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "questions_images" ADD CONSTRAINT "questions_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions_form_elements_options" ADD CONSTRAINT "questions_form_elements_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions_form_elements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions_form_elements" ADD CONSTRAINT "questions_form_elements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_current_survey_id_surveys_id_fk" FOREIGN KEY ("current_survey_id") REFERENCES "public"."surveys"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_last_completed_question_id_questions_id_fk" FOREIGN KEY ("last_completed_question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "responses_reselection_events" ADD CONSTRAINT "responses_reselection_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "responses" ADD CONSTRAINT "responses_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "responses" ADD CONSTRAINT "responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "responses" ADD CONSTRAINT "responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "surveys_slug_idx" ON "surveys" USING btree ("slug");
  CREATE INDEX "surveys_updated_at_idx" ON "surveys" USING btree ("updated_at");
  CREATE INDEX "surveys_created_at_idx" ON "surveys" USING btree ("created_at");
  CREATE INDEX "surveys_rels_order_idx" ON "surveys_rels" USING btree ("order");
  CREATE INDEX "surveys_rels_parent_idx" ON "surveys_rels" USING btree ("parent_id");
  CREATE INDEX "surveys_rels_path_idx" ON "surveys_rels" USING btree ("path");
  CREATE INDEX "surveys_rels_questions_id_idx" ON "surveys_rels" USING btree ("questions_id");
  CREATE INDEX "questions_images_order_idx" ON "questions_images" USING btree ("_order");
  CREATE INDEX "questions_images_parent_id_idx" ON "questions_images" USING btree ("_parent_id");
  CREATE INDEX "questions_images_image_idx" ON "questions_images" USING btree ("image_id");
  CREATE INDEX "questions_form_elements_options_order_idx" ON "questions_form_elements_options" USING btree ("_order");
  CREATE INDEX "questions_form_elements_options_parent_id_idx" ON "questions_form_elements_options" USING btree ("_parent_id");
  CREATE INDEX "questions_form_elements_order_idx" ON "questions_form_elements" USING btree ("_order");
  CREATE INDEX "questions_form_elements_parent_id_idx" ON "questions_form_elements" USING btree ("_parent_id");
  CREATE INDEX "questions_updated_at_idx" ON "questions" USING btree ("updated_at");
  CREATE INDEX "questions_created_at_idx" ON "questions" USING btree ("created_at");
  CREATE UNIQUE INDEX "participants_participant_id_idx" ON "participants" USING btree ("participant_id");
  CREATE UNIQUE INDEX "participants_unique_link_token_idx" ON "participants" USING btree ("unique_link_token");
  CREATE INDEX "participants_current_survey_idx" ON "participants" USING btree ("current_survey_id");
  CREATE INDEX "participants_last_completed_question_idx" ON "participants" USING btree ("last_completed_question_id");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  CREATE INDEX "responses_reselection_events_order_idx" ON "responses_reselection_events" USING btree ("_order");
  CREATE INDEX "responses_reselection_events_parent_id_idx" ON "responses_reselection_events" USING btree ("_parent_id");
  CREATE INDEX "responses_participant_idx" ON "responses" USING btree ("participant_id");
  CREATE INDEX "responses_survey_idx" ON "responses" USING btree ("survey_id");
  CREATE INDEX "responses_question_idx" ON "responses" USING btree ("question_id");
  CREATE INDEX "responses_updated_at_idx" ON "responses" USING btree ("updated_at");
  CREATE INDEX "responses_created_at_idx" ON "responses" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_surveys_fk" FOREIGN KEY ("surveys_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_questions_fk" FOREIGN KEY ("questions_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_responses_fk" FOREIGN KEY ("responses_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_surveys_id_idx" ON "payload_locked_documents_rels" USING btree ("surveys_id");
  CREATE INDEX "payload_locked_documents_rels_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("questions_id");
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");
  CREATE INDEX "payload_locked_documents_rels_responses_id_idx" ON "payload_locked_documents_rels" USING btree ("responses_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "surveys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surveys_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_form_elements_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_form_elements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "participants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "responses_reselection_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "responses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "surveys" CASCADE;
  DROP TABLE "surveys_rels" CASCADE;
  DROP TABLE "questions_images" CASCADE;
  DROP TABLE "questions_form_elements_options" CASCADE;
  DROP TABLE "questions_form_elements" CASCADE;
  DROP TABLE "questions" CASCADE;
  DROP TABLE "participants" CASCADE;
  DROP TABLE "responses_reselection_events" CASCADE;
  DROP TABLE "responses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_surveys_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_participants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_responses_fk";
  
  DROP INDEX "payload_locked_documents_rels_surveys_id_idx";
  DROP INDEX "payload_locked_documents_rels_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_participants_id_idx";
  DROP INDEX "payload_locked_documents_rels_responses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "surveys_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "participants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "responses_id";
  DROP TYPE "public"."enum_surveys_status";
  DROP TYPE "public"."enum_questions_form_elements_type";
  DROP TYPE "public"."enum_questions_type";
  DROP TYPE "public"."enum_participants_status";`)
}
