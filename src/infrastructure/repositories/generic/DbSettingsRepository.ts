import { IGuildSettingsRepository } from '../../../domain/repositories/IGuildSettingsRepository';
import { GuildSettings } from '../../../domain/entities/GuildSettings';
import { IDatabase } from '../../database/interfaces/IDatabase';
import { QueryBuilder } from '../../database/QueryBuilder';

export class DbSettingsRepository implements IGuildSettingsRepository {
    constructor(private readonly db: IDatabase) { }

    async get(guildId: string): Promise<GuildSettings | null> {
        const { sql, params } = new QueryBuilder()
            .table('guild_settings')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.db.query(sql, params);
        return rows.length > 0 ? (rows[0] as GuildSettings) : null;
    }

    async save(settings: GuildSettings): Promise<void> {
        const existing = await this.get(settings.guild_id);

        if (existing) {
            const { sql, params } = new QueryBuilder()
                .table('guild_settings')
                .update({
                    language: settings.language,
                    manager_role_id: settings.manager_role_id
                })
                .where('guild_id', '=', settings.guild_id)
                .build();
            await this.db.execute(sql, params);
        } else {
            const { sql, params } = new QueryBuilder()
                .table('guild_settings')
                .insert({
                    guild_id: settings.guild_id,
                    language: settings.language,
                    manager_role_id: settings.manager_role_id
                })
                .build();
            await this.db.execute(sql, params);
        }
    }
}
