import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { GiveawayTemplate } from '../../../domain/entities/GiveawayTemplate';
import { IDatabase } from '../../database/interfaces/IDatabase';
import { QueryBuilder } from '../../database/QueryBuilder';

export class DbTemplateRepository implements ITemplateRepository {
    constructor(private readonly db: IDatabase) { }

    async create(template: Omit<GiveawayTemplate, 'id' | 'created_at'>): Promise<void> {
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
        await this.db.execute(sql, params);
    }

    async getAll(guildId: string): Promise<GiveawayTemplate[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapTemplate(r));
    }

    async get(guildId: string, name: string): Promise<GiveawayTemplate | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('guild_id', '=', guildId)
            .where('name', '=', name)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? this.mapTemplate(rows[0]) : null;
    }

    async getById(id: number): Promise<GiveawayTemplate | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .select('*')
            .where('id', '=', id)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? this.mapTemplate(rows[0]) : null;
    }

    async delete(guildId: string, name: string): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_templates')
            .delete()
            .where('guild_id', '=', guildId)
            .where('name', '=', name)
            .build();
        await this.db.execute(sql, params);
    }

    private mapTemplate(row: any): GiveawayTemplate {
        return {
            ...row,
            created_at: new Date(row.created_at)
        };
    }
}
