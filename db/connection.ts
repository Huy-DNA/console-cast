import pg from 'pg';

export const initDbPool = async () => {
  const { DATABASE_HOST, DATABASE_USER, DATABASE_PORT, DATABASE_NAME, DATABASE_PASSWORD } = useRuntimeConfig();

  const dbPool = new pg.Pool({
    user: DATABASE_USER,
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    port: parseInt(DATABASE_PORT || '5432'),
  });

  await dbPool.connect();

  return dbPool;
};

export const dbPool = await initDbPool();
