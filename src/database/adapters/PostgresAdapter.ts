import { IDatabase } from '../interfaces/IDatabase';
import { Pool } from 'pg';

export class PostgresAdapter implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'discord_giveaway',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
    }

    private transformSql(sql: string): string {
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    }

    async query(sql: string, params?: any[]): Promise<any> {
        const transformedSql = this.transformSql(sql);
        const res = await this.pool.query(transformedSql, params);
        return res.rows;
    }

    async execute(sql: string, params?: any[]): Promise<any> {
        const transformedSql = this.transformSql(sql);
        const res = await this.pool.query(transformedSql, params);
        return {
            affectedRows: res.rowCount,
            // PG returns rows on INSERT if you use RETURNING, handled differently usually.
            // For basic compatibility we might not get insertId easily without RETURNING id.
            // But we'll leave it as is for now.
        };
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
