const { Pool } = require('pg');

// Use environment variables for secure connection details
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT, // e.g., 5432
});

export default pool;

// Optional: Test the connection
pool.connect((err : any, client : any, release : any) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to the database!');
    release(); // Release the client back to the pool
});
