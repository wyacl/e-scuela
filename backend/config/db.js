const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Immediately test the connection upon initialization
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database successfully connected.');
        connection.release();
    })
    .catch(error => {
        console.error('❌ MySQL Connection Error:');
        console.error(error.message);
        process.exit(1);
    });

module.exports = pool;