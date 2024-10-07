-- migrate:up

--- set unique on users name
ALTER TABLE users
  ADD CONSTRAINT c_uniq_users_name UNIQUE(name);

--- set default on deleted_at
ALTER TABLE groups
  ALTER COLUMN deleted_at SET DEFAULT NULL;

ALTER TABLE users
  ALTER COLUMN deleted_at SET DEFAULT NULL;

ALTER TABLE files
  ALTER COLUMN deleted_at SET DEFAULT NULL;

--- set index on users
---- we want to support fast retrieval of all users in a given group
CREATE INDEX idx_users_group_id
  ON users
  USING HASH
  (group_id);

--- set index on files
---- we want to support fast LIKE query in the form of LIKE 'foo%'
CREATE INDEX idx_files_name
  ON files
  USING BTREE
  (name text_pattern_ops);

-- migrate:down

ALTER TABLE users
  REMOVE CONSTRAINT c_uniq_users_name UNIQUE(name);

ALTER TABLE groups
  ALTER COLUMN deleted_at DROP DEFAULT;

ALTER TABLE users
  ALTER COLUMN deleted_at DROP DEFAULT;

ALTER TABLE files
  ALTER COLUMN deleted_at DROP DEFAULT;

DROP INDEX idx_users_group_id;

DROP INDEX idx_files_name;
