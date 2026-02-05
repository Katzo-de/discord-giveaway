import { config } from 'dotenv';
import { Bot } from './Bot';
import { initDb } from './infrastructure/database/init';

config();

const client = new Bot();

(async () => {
    await initDb();
    await client.start();
})();
