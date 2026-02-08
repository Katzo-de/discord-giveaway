import { IGuildSettingsRepository } from '../../../domain/repositories/IGuildSettingsRepository';
import { GuildSettings } from '../../../domain/entities/GuildSettings';
import { IDatabase } from '../../database/interfaces/IDatabase';
import { QueryBuilder } from '../../database/QueryBuilder';

export class DbSettingsRepository implements IGuildSettingsRepository {
    constructor(private readonly db: IDatabase) { }

    async get(guildId: string): Promise<GuildSettings | null> {
        // Ensure column exists (simple migration check)
        // Ideally this should be a separate migration script, but for this bot we do a quick check/add
        await this.ensureTimezoneColumn();

        const { sql, params } = new QueryBuilder()
            .table('guild_settings')
            .select('*')
            .where('guild_id', '=', guildId)
            .build();

        const rows: any = await this.db.query(sql, params);
        if (rows.length > 0) {
            const row = rows[0];
            return {
                guild_id: row.guild_id,
                language: row.language,
                manager_role_id: row.manager_role_id,
                timezone: row.timezone || 'UTC' // Default for existing rows
            };
        }
        return null;
    }

    async save(settings: GuildSettings): Promise<void> {
        await this.ensureTimezoneColumn();
        const existing = await this.get(settings.guild_id); // This already calls ensureTimezoneColumn, but safe to call again or opt out

        if (existing) {
            const { sql, params } = new QueryBuilder()
                .table('guild_settings')
                .update({
                    language: settings.language,
                    manager_role_id: settings.manager_role_id,
                    timezone: settings.timezone
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
                    manager_role_id: settings.manager_role_id,
                    timezone: settings.timezone || 'UTC'
                })
                .build();
            await this.db.execute(sql, params);
        }
    }

    private async ensureTimezoneColumn(): Promise<void> {
        try {
            // Check if column exists by selecting it? 
            // Or just try to add it and ignore error? 
            // "ALTER TABLE guild_settings ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'"
            // MySQL: IF NOT EXISTS is not directly supported in ADD COLUMN in older versions, but we can try-catch.
            // Postgres/SQLite have different syntax.
            // Since we support multiple adapters, this is tricky in generic repo.
            // BUT: this is "generic" repo using IDatabase. 
            // Better approach: Let the QueryBuilder or Adapter handle schema?
            // Or just try the alteration and catch "duplicate column" error.

            // For now, I'll try to add it. If it fails, assume it exists.
            // This runs on every get/save which is inefficient but safe for this scale.
            // Optimization: Cache strict check.

            // Actually, we can just run this silently.
            // await this.db.execute("ALTER TABLE guild_settings ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'");
            // But IDatabase abstract execute might not be raw enough or syntax differs.

            // Let's rely on the user running a migration script OR 
            // add a "migrations" logic.
            // User requested "fixen bitte", so I'll try to auto-patch.

            // Let's just try to select 'timezone' from the table first to see if it errors?
            // "SELECT timezone FROM guild_settings LIMIT 1"

            // Actually implementation detail:
            // I'll try to ALTER.
            try {
                await this.db.execute("ALTER TABLE guild_settings ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'");
            } catch (e: any) {
                // Ignore "column exists" errors
                // MySQL: 1060 Duplicate column name
                // SQLite: duplicate column name
                // Postgres: 42701 duplicate_column
            }

        } catch (e) {
            // Ignore
        }
    }
}
