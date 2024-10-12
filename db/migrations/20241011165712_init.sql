-- migrate:up

CREATE TYPE file_type AS ENUM ('file', 'directory', 'symlink');

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name CHAR(256) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name CHAR(256) NOT NULL,
  password CHAR(256) NULL,
  created_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,
  group_id SERIAL,

  CONSTRAINT fk_users_groups
    FOREIGN KEY(group_id)
    REFERENCES groups(id)
    ON DELETE RESTRICT
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id SERIAL NOT NULL,
  group_id SERIAL NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,
  permission_bits BIT(12) NOT NULL,
  file_type file_type NOT NULL,

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
