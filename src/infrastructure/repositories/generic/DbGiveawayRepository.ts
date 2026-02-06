import { IGiveawayRepository } from '../../../domain/repositories/IGiveawayRepository';
import { Giveaway } from '../../../domain/entities/Giveaway';
import { IDatabase } from '../../database/interfaces/IDatabase';
import { QueryBuilder } from '../../database/QueryBuilder';

export class DbGiveawayRepository implements IGiveawayRepository {
    constructor(private readonly db: IDatabase) { }

    async create(giveaway: Omit<Giveaway, 'id' | 'created_at' | 'ended'>): Promise<Giveaway> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .insert({
                message_id: giveaway.message_id,
                channel_id: giveaway.channel_id,
                guild_id: giveaway.guild_id,
                title: giveaway.title,
                description: giveaway.description,
                prize: giveaway.prize,
                winners: giveaway.winners,
                end_time: giveaway.end_time.toISOString().slice(0, 19).replace('T', ' '),
                hosted_by: giveaway.hosted_by,
                ping_role_id: giveaway.ping_role_id ?? null,
                ended: 0
            })
            .build();

        const result = await this.db.execute(sql, params);
        // IDatabase.execute returns { insertId: number, affectedRows: number }

        return {
            ...giveaway,
            id: result.insertId,
            ended: false,
            created_at: new Date()
        };
    }

    async getById(id: number): Promise<Giveaway | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .select('*')
            .where('id', '=', id)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? this.mapGiveaway(rows[0]) : null;
    }

    async getByMessageId(messageId: string): Promise<Giveaway | null> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .select('*')
            .where('message_id', '=', messageId)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? this.mapGiveaway(rows[0]) : null;
    }

    async getActive(guildId: string): Promise<Giveaway[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .select('*')
            .where('guild_id', '=', guildId)
            .where('ended', '=', 0)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapGiveaway(r)!);
    }

    async getAllActive(): Promise<Giveaway[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .select('*')
            .where('ended', '=', 0)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapGiveaway(r)!);
    }

    async update(giveaway: Giveaway): Promise<void> {
        console.log(`[Repo] Updating giveaway ${giveaway.id} with message_id=${giveaway.message_id}`);
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .update({
                message_id: giveaway.message_id,
                channel_id: giveaway.channel_id,
                guild_id: giveaway.guild_id,
                title: giveaway.title,
                description: giveaway.description,
                prize: giveaway.prize,
                winners: giveaway.winners,
                end_time: giveaway.end_time.toISOString().slice(0, 19).replace('T', ' '),
                hosted_by: giveaway.hosted_by,
                ping_role_id: giveaway.ping_role_id ?? null,
                ended: giveaway.ended ? 1 : 0
            })
            .where('id', '=', giveaway.id)
            .build();

        console.log(`[Repo] SQL: ${sql}`);
        console.log(`[Repo] Params: ${JSON.stringify(params)}`);

        await this.db.execute(sql, params);
    }

    async addEntry(giveawayId: number, userId: string): Promise<boolean> {
        try {
            const { sql, params } = new QueryBuilder()
                .table('giveaway_entries')
                .insert({
                    giveaway_id: giveawayId,
                    user_id: userId
                })
                .build();
            await this.db.execute(sql, params);
            return true;
        } catch (error: any) {
            // Need to handle error code. IDatabase execute might just filter up.
            // Sqlite Unique constraint error check
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
                return false;
            }
            throw error;
        }
    }

    async countEntries(giveawayId: number): Promise<number> {
        // Raw query for count
        const rows: any = await this.db.query('SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);
        return rows[0].count;
    }

    async getEntries(giveawayId: number): Promise<string[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaway_entries')
            .select('user_id')
            .where('giveaway_id', '=', giveawayId)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => r.user_id);
    }

    async delete(id: number): Promise<void> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .delete()
            .where('id', '=', id)
            .build();
        await this.db.execute(sql, params);
    }

    private mapGiveaway(row: any): Giveaway | null {
        if (!row) return null;
        return {
            ...row,
            ended: !!row.ended,
            end_time: new Date(row.end_time),
            created_at: new Date(row.created_at)
        };
    }

    async getEndingBefore(date: Date): Promise<Giveaway[]> {
        const { sql, params } = new QueryBuilder()
            .table('giveaways')
            .select('*')
            .where('end_time', '<=', date.toISOString().slice(0, 19).replace('T', ' '))
            .where('ended', '=', 0)
            .build();
        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapGiveaway(r)!);
    }

    async search(query: string, ended: boolean): Promise<Giveaway[]> {
        // QueryBuilder might need 'like' support or raw query if not present.
        // Assuming raw query for LIKE support for now or extending QueryBuilder.
        // Let's use raw query via IDatabase.query for simplicity/certainty.
        // IDatabase.query signature: query(sql, params)
        const sql = `SELECT * FROM giveaways WHERE ended = ? AND title LIKE ? LIMIT 25`;
        const params = [ended ? 1 : 0, `%${query}%`];
        const rows: any = await this.db.query(sql, params);
        return rows.map((r: any) => this.mapGiveaway(r)!);
    }
}
