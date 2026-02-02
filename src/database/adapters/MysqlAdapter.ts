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

    async getGuildSettings(guildId: string): Promise<import('../../interface/GuildSettings').GuildSettings | null> {
        const rows: any = await this.query('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
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
