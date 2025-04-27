-- Add description column to widgets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'widgets' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE "widgets" ADD COLUMN "description" text;
    END IF;
END $$;

-- Then handle the db_schemas table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'db_schemas') THEN
        CREATE TABLE "db_schemas" (
            "id" serial PRIMARY KEY NOT NULL,
            "connection_id" integer,
            "name" text NOT NULL,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now()
        );
    END IF;
END $$; 