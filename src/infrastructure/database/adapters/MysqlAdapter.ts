import { IDatabase } from '../interfaces/IDatabase';
import mysql, { Pool } from 'mysql2/promise';
import { QueryBuilder } from '../QueryBuilder';

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

    async getGuildSettings(guildId: string): Promise<import('../../../domain/entities/GuildSettings').GuildSettings | null> {
        const { sql, params } = new QueryBuilder()
            .table('guild_settings')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async setGuildSettings(guildId: string, settings: Partial<import('../../../domain/entities/GuildSettings').GuildSettings>): Promise<void> {
        const current = await this.getGuildSettings(guildId);

        if (current) {
            const language = settings.language ?? current.language;
            const managerRoleId = settings.manager_role_id ?? current.manager_role_id;

            const { sql, params } = new QueryBuilder()
                .table('guild_settings')
                .update({
                    language,
                    manager_role_id: managerRoleId
                })
                .where('guild_id', '=', guildId)
                .build();

            await this.query(sql, params);
        } else {
            const language = settings.language || 'en';
            const managerRoleId = settings.manager_role_id || null;

            const { sql, params } = new QueryBuilder()
                .table('guild_settings')
                .insert({
                    guild_id: guildId,
                    language,
                    manager_role_id: managerRoleId
                })
                .build();

            await this.query(sql, params);
        }
    }

    async createTemplate(template: Omit<import('../../../domain/entities/GiveawayTemplate').GiveawayTemplate, 'id' | 'created_at'>): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .insert({
                guild_id: template.guild_id,
                name: template.name,
                title: template.title,
                description: template.description,
                prize: template.prize,
                duration: template.duration
            })
            .build();

        await this.query(sql, params);
    }

    async getTemplates(guildId: string): Promise<import('../../../domain/entities/GiveawayTemplate').GiveawayTemplate[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.query(sql, params);
        return rows;
    }

    async getTemplate(guildId: string, name: string): Promise<import('../../../domain/entities/GiveawayTemplate').GiveawayTemplate | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('guild_id', '=', guildId)
            .where('name', '=', name)
            .build();

        const rows: any = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async getTemplateById(id: number): Promise<import('../../../domain/entities/GiveawayTemplate').GiveawayTemplate | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('id', '=', id)
            .build();

        const rows: any = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async deleteTemplate(guildId: string, name: string): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .delete()
            .where('guild_id', '=', guildId)
            .where('name', '=', name)
            .build();

        await this.query(sql, params);
    }
}
