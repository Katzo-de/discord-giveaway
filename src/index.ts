import { config } from 'dotenv';
import { Bot } from './Bot';
import { initDb } from './infrastructure/database/init';

import { dbAdapter } from './container';

config();

const client = new Bot();

// Graceful Shutdown
const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
        await client.stop();
        await dbAdapter.close();
        console.log('Database connection closed.');
        console.log('Graceful shutdown completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

(async () => {
    await initDb();
    await client.start();
})();
