/**
 * config/db.js — MySQL connection pool using AWS RDS credentials
 * Uses environment variables — never hardcoded credentials
 */

const mysql = require("mysql2");

// Create a connection pool for better performance and reliability
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    10,   // max simultaneous connections
  queueLimit:         0,
  connectTimeout:     10000,
});

// Verify connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to Amazon RDS MySQL database");
    connection.release();
  }
});

// Export promise-based pool for async/await usage
module.exports = pool.promise();
