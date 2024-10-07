-- migrate:up

INSERT INTO groups (id, name, created_at)
  VALUES
    (0, 'root', NOW());

INSERT INTO groups (name, created_at)
  VALUES
    ('guest', NOW());

INSERT INTO users (id, name, password, created_at, group_id)
  VALUES (0, 'root', NULL, NOW(), 0);

INSERT INTO users (name, password, created_at, group_id)
  VALUES ('guest', NULL, NOW(), 1);

INSERT INTO files (name, owner_id, group_id, created_at, updated_at, deleted_at, permission_bits, file_type)
  VALUES
    ('', 0, 0, NOW(), NOW(), NULL, B'000111111101', 'directory'),
    ('/home', 0, 0, NOW(), NOW(), NULL, B'000111111101', 'directory'),
    ('/home/guest', 1, 1, NOW(), NOW(), NULL, B'000111111101', 'directory');

-- migrate:down

DELETE FROM groups;
DELETE FROM users;
DELETE FROM files;
