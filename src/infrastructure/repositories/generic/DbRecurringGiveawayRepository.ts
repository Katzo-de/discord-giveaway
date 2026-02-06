import { IRecurringGiveawayRepository } from '../../../domain/repositories/IRecurringGiveawayRepository';
import { RecurringGiveaway } from '../../../domain/entities/RecurringGiveaway';
import { IDatabase } from '../../database/interfaces/IDatabase';
import { QueryBuilder } from '../../database/QueryBuilder';

export class DbRecurringGiveawayRepository implements IRecurringGiveawayRepository {
    constructor(private readonly db: IDatabase) { }

    async create(data: Omit<RecurringGiveaway, 'id'>): Promise<RecurringGiveaway> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .insert({
                guild_id: data.guild_id,
                template_id: data.template_id,
                channel_id: data.channel_id,
                interval_ms: data.interval_ms,
                winners_count: data.winners_count,
                ping_role_id: data.ping_role_id || null,
                last_run_at: data.last_run_at ? data.last_run_at.toISOString().slice(0, 19).replace('T', ' ') : null,
                active: data.active ? 1 : 0
            })
            .build();

        const result = await this.db.execute(sql, params);

        return {
            ...data,
            id: result.insertId
        };
    }

    async getById(id: number): Promise<RecurringGiveaway | null> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .select('*')
            .where('id', '=', id)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? this.mapRecurring(rows[0]) : null;
    }

    async getAllActive(): Promise<RecurringGiveaway[]> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .select('*')
            .where('active', '=', 1)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapRecurring(r)!);
    }

    async update(recurring: RecurringGiveaway): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .update({
                guild_id: recurring.guild_id,
                template_id: recurring.template_id,
                channel_id: recurring.channel_id,
                interval_ms: recurring.interval_ms,
                winners_count: recurring.winners_count,
                ping_role_id: recurring.ping_role_id || null,
                last_run_at: recurring.last_run_at ? recurring.last_run_at.toISOString().slice(0, 19).replace('T', ' ') : null,
                active: recurring.active ? 1 : 0
            })
            .where('id', '=', recurring.id)
            .build();

        await this.db.execute(sql, params);
    }

    async delete(id: number): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .delete()
            .where('id', '=', id)
            .build();

        await this.db.execute(sql, params);
    }

    async getByGuildId(guildId: string): Promise<RecurringGiveaway[]> {
        const { sql, params } = new QueryBuilder()
            .table('recurring_giveaways')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapRecurring(r)!);
    }

    private mapRecurring(row: any): RecurringGiveaway | null {
        if (!row) return null;
        return {
            ...row,
            active: !!row.active,
            last_run_at: row.last_run_at ? new Date(row.last_run_at) : undefined
        };
    }
}
