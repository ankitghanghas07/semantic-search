-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- documents
-- CREATE TABLE documents (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   filename TEXT NOT NULL,
--   s3_path TEXT NOT NULL,
--   checksum TEXT,
--   content_type TEXT,
--   status TEXT NOT NULL DEFAULT 'processing',
--   text_length INT,
--   num_chunks INT DEFAULT 0,
--   uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   ready_at TIMESTAMPTZ,
--   error_message TEXT
-- );

-- jobs
-- CREATE TABLE jobs (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   document_id UUID REFERENCES documents(id),
--   job_type TEXT NOT NULL,
--   status TEXT NOT NULL DEFAULT 'queued',
--   attempts INT NOT NULL DEFAULT 0,
--   max_attempts INT NOT NULL DEFAULT 5,
--   last_error TEXT,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   started_at TIMESTAMPTZ,
--   finished_at TIMESTAMPTZ
-- );

-- chunks
-- CREATE TABLE chunks (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
--   chunk_index INT NOT NULL,
--   char_start INT NOT NULL,
--   char_end INT NOT NULL,
--   page_number INT,
--   text TEXT NOT NULL,
--   token_count INT,
--   milvus_id BIGINT,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE (document_id, chunk_index)
-- );
