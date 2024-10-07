import pg from 'pg';

export const initDbClient = async () => {
  const { DATABASE_HOST, DATABASE_USER, DATABASE_PORT, DATABASE_NAME, DATABASE_PASSWORD } = useRuntimeConfig();

  const dbClient = new pg.Client({
    user: DATABASE_USER,
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    port: parseInt(DATABASE_PORT || '5432'),
  });

  await dbClient.connect();

  return dbClient;
};
