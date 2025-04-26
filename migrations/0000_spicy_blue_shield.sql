CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"space_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"dashboard_id" integer NOT NULL,
	"widget_id" integer NOT NULL,
	"position" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "dashboard_widgets_dashboard_id_widget_id_pk" PRIMARY KEY("dashboard_id","widget_id")
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"space_id" integer,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"layout" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"connection_id" integer,
	"name" text NOT NULL,
	"query" text,
	"refresh_interval" text DEFAULT 'manual',
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "db_qa_alert_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"alert_id" integer NOT NULL,
	"channel" text NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"status" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "db_qa_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"query_id" integer NOT NULL,
	"space_id" integer,
	"execution_result_id" integer,
	"name" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'medium' NOT NULL,
	"condition" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"enabled" boolean DEFAULT true,
	"notification_channels" jsonb DEFAULT '[]'::jsonb,
	"email_recipients" text,
	"slack_webhook" text,
	"custom_webhook" text,
	"throttle_minutes" integer DEFAULT 60,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "db_qa_dashboard_queries" (
	"dashboard_id" integer NOT NULL,
	"query_id" integer NOT NULL,
	"position" jsonb DEFAULT '{}'::jsonb,
	"visualization_type" text DEFAULT 'table',
	"visualization_config" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "db_qa_dashboard_queries_dashboard_id_query_id_pk" PRIMARY KEY("dashboard_id","query_id")
);
--> statement-breakpoint
CREATE TABLE "db_qa_dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"space_id" integer,
	"name" text NOT NULL,
	"description" text,
	"layout" jsonb DEFAULT '{}'::jsonb,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "db_qa_execution_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"query_id" integer NOT NULL,
	"execution_time" timestamp DEFAULT now(),
	"status" text NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"execution_duration" integer,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "db_qa_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"connection_id" integer NOT NULL,
	"space_id" integer,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"query" text NOT NULL,
	"expected_result" jsonb DEFAULT '{}'::jsonb,
	"thresholds" jsonb DEFAULT '{}'::jsonb,
	"enabled" boolean DEFAULT true,
	"execution_frequency" text DEFAULT 'manual',
	"last_execution_time" timestamp,
	"next_execution_time" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"logo_url" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_private" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_spaces" (
	"user_id" integer NOT NULL,
	"space_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "user_spaces_user_id_space_id_pk" PRIMARY KEY("user_id","space_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"email" text,
	"theme" text DEFAULT 'light',
	"language" text DEFAULT 'en',
	"time_zone" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"role" text DEFAULT 'user',
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"dataset_id" integer,
	"connection_id" integer,
	"space_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"custom_query" text,
	"is_template" boolean DEFAULT false,
	"source_widget_id" integer,
	"is_global" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboard_id_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_alert_notifications" ADD CONSTRAINT "db_qa_alert_notifications_alert_id_db_qa_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."db_qa_alerts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_alerts" ADD CONSTRAINT "db_qa_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_alerts" ADD CONSTRAINT "db_qa_alerts_query_id_db_qa_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."db_qa_queries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_alerts" ADD CONSTRAINT "db_qa_alerts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_alerts" ADD CONSTRAINT "db_qa_alerts_execution_result_id_db_qa_execution_results_id_fk" FOREIGN KEY ("execution_result_id") REFERENCES "public"."db_qa_execution_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_dashboard_queries" ADD CONSTRAINT "db_qa_dashboard_queries_dashboard_id_db_qa_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."db_qa_dashboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_dashboard_queries" ADD CONSTRAINT "db_qa_dashboard_queries_query_id_db_qa_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."db_qa_queries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_dashboards" ADD CONSTRAINT "db_qa_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_dashboards" ADD CONSTRAINT "db_qa_dashboards_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_execution_results" ADD CONSTRAINT "db_qa_execution_results_query_id_db_qa_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."db_qa_queries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_queries" ADD CONSTRAINT "db_qa_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_queries" ADD CONSTRAINT "db_qa_queries_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "db_qa_queries" ADD CONSTRAINT "db_qa_queries_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spaces" ADD CONSTRAINT "user_spaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spaces" ADD CONSTRAINT "user_spaces_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_source_widget_id_widgets_id_fk" FOREIGN KEY ("source_widget_id") REFERENCES "public"."widgets"("id") ON DELETE no action ON UPDATE no action;