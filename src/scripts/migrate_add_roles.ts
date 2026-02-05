
import 'dotenv/config';
import { dbAdapter as db } from '../container';

async function migrate() {
    try {
        console.log('Running migration: Add role columns to giveaways table');

        // Check if columns exist (simple try catch with add, or check information_schema)
        // Since we are on MySQL (implied by schema.sql), we can just try ALTER IGNORE or checking first.
        // But safe way is just try/catch block for each column or use IF NOT EXISTS syntax if supported (MySQL 8.0.29+).
        // Let's assume standard MySQL and just try. If it fails due to Duplicate column, we ignore.

        try {
            await db.execute(`ALTER TABLE giveaways ADD COLUMN ping_role_id VARCHAR(255)`);
            console.log('Added ping_role_id');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ping_role_id already exists');
            } else {
                console.error('Error adding ping_role_id:', e);
            }
        }

        try {
            await db.execute(`ALTER TABLE giveaways ADD COLUMN giveaway_role_id VARCHAR(255)`);
            console.log('Added giveaway_role_id');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('giveaway_role_id already exists');
            } else {
                console.error('Error adding giveaway_role_id:', e);
            }
        }

        console.log('Migration complete');
        await db.close();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
