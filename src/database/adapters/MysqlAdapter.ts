import { IDatabase } from '../interfaces/IDatabase';
import mysql, { Pool } from 'mysql2/promise';

export class MysqlAdapter implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'discord_giveaway',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async query(sql: string, params?: any[]): Promise<any> {
        const [rows] = await this.pool.query(sql, params);
        return rows;
    }

    async execute(sql: string, params?: any[]): Promise<any> {
        const [result] = await this.pool.execute(sql, params);
        return result;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
