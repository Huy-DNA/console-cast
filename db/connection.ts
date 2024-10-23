import pg from 'pg';

export const initDbPool = () => {
  const { DATABASE_HOST, DATABASE_USER, DATABASE_PORT, DATABASE_NAME, DATABASE_PASSWORD } = useRuntimeConfig();

  const dbPool = new pg.Pool({
    user: DATABASE_USER,
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    port: parseInt(DATABASE_PORT || '5432'),
  }).on('error', console.error);

  return dbPool;
};

export const dbPool = initDbPool();
