import db from './db';
import fs from 'fs';
import path from 'path';

async function initDb() {
  try {
    // Check connection by running a simple query
    await db.query('SELECT 1');
    console.log('Successfully connected to the database.');

    const type = process.env.DB_TYPE || 'mysql';
    let schemaFileName = 'schema.sql';

    if (type.toLowerCase() === 'sqlite') {
        schemaFileName = 'schema.sqlite.sql';
    } else if (type.toLowerCase() === 'postgres' || type.toLowerCase() === 'postgresql') {
        schemaFileName = 'schema.postgres.sql';
    }

    const schemaPath = path.join(__dirname, schemaFileName);
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split queries by semicolon to execute them one by one
    const queries = schema.split(';').filter(query => query.trim().length > 0);

    for (const query of queries) {
        if (type.toLowerCase() === 'sqlite' || type.toLowerCase() === 'postgres' || type.toLowerCase() === 'postgresql') {
             await db.execute(query);
        } else {
             // MySQL adapter's execute might return different structure, but IDatabase enforces unified method.
             // However, original code used connection.query for schema in Mysql.
             // Our Adapter wraps .execute which is fine for DDL usually, or .query.
             await db.execute(query);
        }
    }
    console.log(`Database schema initialized using ${schemaFileName}.`);
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

initDb();
