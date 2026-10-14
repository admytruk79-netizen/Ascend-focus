CREATE TABLE IF NOT EXISTS focus_catalog (singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),revision integer NOT NULL DEFAULT 1,exercises jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS focus_admin_sessions (token_hash text PRIMARY KEY,auth_cookies text NOT NULL,email text NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS focus_auth_attempts (key_hash text PRIMARY KEY,attempts integer NOT NULL,window_end timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS focus_catalog_audit (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,revision integer NOT NULL,actor_email text NOT NULL,previous_exercises jsonb NOT NULL,published_exercises jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());

