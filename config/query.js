const { pool } = require('./database');

async function query(text, params) {
    try {
      const result = await pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL query:', error);
      throw error; 
    }
  }

  module.exports = { query };