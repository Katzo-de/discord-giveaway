import { IDatabase } from '../interfaces/IDatabase';
import Database from 'better-sqlite3';
import path from 'path';

export class SqliteAdapter implements IDatabase {
    private db: Database.Database;

    constructor() {
        const dbPath = process.env.DB_FILENAME || 'giveaway.sqlite';
        this.db = new Database(dbPath);
    }

    async query(sql: string, params?: any[]): Promise<any> {
        // better-sqlite3 uses synchronous methods
        const stmt = this.db.prepare(sql);
        return stmt.all(params || []);
    }

    async execute(sql: string, params?: any[]): Promise<any> {
        const stmt = this.db.prepare(sql);
        const info = stmt.run(params || []);
        return {
            insertId: info.lastInsertRowid,
            affectedRows: info.changes
        };
    }

    async close(): Promise<void> {
        this.db.close();
    }

    async getGuildSettings(guildId: string): Promise<import('../../interface/GuildSettings').GuildSettings | null> {
        const row = this.db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
        return row as import('../../interface/GuildSettings').GuildSettings | null;
    }

    async setGuildSettings(guildId: string, settings: Partial<import('../../interface/GuildSettings').GuildSettings>): Promise<void> {
        const current = await this.getGuildSettings(guildId);

        if (current) {
            const language = settings.language ?? current.language;
            const managerRoleId = settings.manager_role_id ?? current.manager_role_id;

            this.db.prepare('UPDATE guild_settings SET language = ?, manager_role_id = ? WHERE guild_id = ?')
                .run(language, managerRoleId, guildId);
        } else {
            const language = settings.language || 'en';
            const managerRoleId = settings.manager_role_id || null; // Fix: use null, not undefined

            this.db.prepare('INSERT INTO guild_settings (guild_id, language, manager_role_id) VALUES (?, ?, ?)')
                .run(guildId, language, managerRoleId);
        }
    }
}
