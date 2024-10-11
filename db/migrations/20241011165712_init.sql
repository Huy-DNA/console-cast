-- migrate:up

CREATE TYPE file_type AS ENUM ('file', 'directory', 'symlink');

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name CHAR(256),
  created_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name CHAR(256),
  password CHAR(256),
  created_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  group_id SERIAL,

  CONSTRAINT fk_users_groups
    FOREIGN KEY(group_id)
    REFERENCES groups(id)
    ON DELETE RESTRICT
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name TEXT,
  owner_id SERIAL,
  group_id SERIAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  permission_bits BIT(12),
  file_type file_type,

  CONSTRAINT fk_files_groups
    FOREIGN KEY(group_id)
    REFERENCES groups(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_files_users
    FOREIGN KEY(owner_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- migrate:down

DROP TYPE file_type;
DROP TABLE files;
DROP TABLE users;
DROP TABLE groups;
