const { Pool } = require('pg');

// Use environment variables for secure connection details
export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT, 
    max: 1,
    connectionTimeoutMillis: 2000
});


// Optional: Test the connection
pool.connect((err : any, client : any, release : any) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to the database!');
    release(); // Release the client back to the pool
});