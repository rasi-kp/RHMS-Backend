// src/database.js
const { Pool } = require('pg');

function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Other database configuration options...
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  console.log('Database connection established');
}

module.exports = { setupDatabase };
