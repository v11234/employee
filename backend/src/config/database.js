const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const host = process.env.DB_HOST || process.env.PGHOST;
const port = process.env.DB_PORT || process.env.PGPORT || 5432;
const database = process.env.DB_NAME || process.env.PGDATABASE;
const username = process.env.DB_USER || process.env.PGUSER;
const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;
const useSsl =
  process.env.DB_SSL === 'true' ||
  Boolean(connectionString) ||
  (typeof host === 'string' && host.includes('neon.tech'));

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : undefined,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = connectionString
  ? new Sequelize(connectionString, baseConfig)
  : new Sequelize(database, username, password, {
      ...baseConfig,
      host,
      port
    });

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
