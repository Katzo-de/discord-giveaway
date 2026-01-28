import pool from './db';
import fs from 'fs';
import path from 'path';

async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split queries by semicolon to execute them one by one
    const queries = schema.split(';').filter(query => query.trim().length > 0);

    for (const query of queries) {
        await connection.query(query);
    }
    console.log('Database schema initialized.');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

initDb();
