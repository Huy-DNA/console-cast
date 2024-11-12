-- migrate:up

CREATE TABLE aliases (
  id INTEGER GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(256) NOT NULL UNIQUE,
  command VARCHAR(1024) NOT NULL,
  owner_id SERIAL,

  CONSTRAINT fk_aliases_users
    FOREIGN KEY(owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- migrate:down

