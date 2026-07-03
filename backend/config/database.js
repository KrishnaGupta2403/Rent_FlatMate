require('dotenv').config();
const { Pool } = require('pg');

// 1. Environment Validation
const hasDbUrl = !!process.env.DATABASE_URL;
const hasDbConfig = !!(
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD
);

if (!hasDbUrl && !hasDbConfig) {
  console.error('✗ Environment Validation Failed: Database configuration is missing.');
  console.error('Provide DATABASE_URL or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env');
  process.exit(1);
}

// 2. Configure PostgreSQL Client Options
const poolConfig = {
  ssl: {
    rejectUnauthorized: false
  }
};

if (hasDbUrl) {
  poolConfig.connectionString = process.env.DATABASE_URL;
} else {
  poolConfig.host = process.env.DB_HOST;
  poolConfig.port = parseInt(process.env.DB_PORT, 10);
  poolConfig.database = process.env.DB_NAME;
  poolConfig.user = process.env.DB_USER;
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

// 3. Error Handling for Idle Client Errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  close: () => pool.end()
};
