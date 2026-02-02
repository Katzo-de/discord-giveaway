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

    async getGuildSettings(guildId: string): Promise<import('../../interface/GuildSettings').GuildSettings | null> {
        const rows = await this.query('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
        return rows.length > 0 ? rows[0] : null;
    }

    async setGuildSettings(guildId: string, settings: Partial<import('../../interface/GuildSettings').GuildSettings>): Promise<void> {
        const current = await this.getGuildSettings(guildId);

        if (current) {
            const language = settings.language ?? current.language;
            const managerRoleId = settings.manager_role_id ?? current.manager_role_id;

            await this.query('UPDATE guild_settings SET language = ?, manager_role_id = ? WHERE guild_id = ?', [language, managerRoleId, guildId]);
        } else {
            const language = settings.language || 'en';
            const managerRoleId = settings.manager_role_id || null;

            await this.query('INSERT INTO guild_settings (guild_id, language, manager_role_id) VALUES (?, ?, ?)', [guildId, language, managerRoleId]);
        }
    }
}
