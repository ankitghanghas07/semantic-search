import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database config:', {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT
});

// Use environment variables for secure connection details
export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    max: 1, 
    connectionTimeoutMillis: 10000
});


// Optional: Test the connection
pool.connect((err : any, client : any, release : any) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to the database!');
    release(); // Release the client back to the pool
});