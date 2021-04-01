module.exports = {
  url: process.env.DATABASE_URL || 'postgres://postgres@127.0.0.1/waitlistthisa_development',
  type: 'postgres',
  extra: process.env.NODE_ENV !== 'production' ? undefined : { ssl: { rejectUnauthorized: false } },
  synchronize: false,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrationsTableName: 'migration',
  migrations: ['migrations/**/*.ts'],
  cli: { migrationsDir: 'migrations' },
};
