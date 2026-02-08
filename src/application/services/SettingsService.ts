import { GuildSettings } from '../../domain/entities/GuildSettings';
import { IGuildSettingsRepository } from '../../domain/repositories/IGuildSettingsRepository';

export class SettingsService {
    constructor(private readonly repository: IGuildSettingsRepository) { }

    async getSettings(guildId: string): Promise<GuildSettings> {
        const settings = await this.repository.get(guildId);
        if (settings) {
            return settings;
        }
        // Default settings if not found
        return {
            guild_id: guildId,
            language: 'en',
            manager_role_id: null,
            timezone: 'UTC'
        };
    }

    async updateSettings(guildId: string, settings: Partial<Omit<GuildSettings, 'guild_id'>>): Promise<void> {
        const current = await this.getSettings(guildId);
        const updated: GuildSettings = {
            ...current,
            ...settings
        };
        await this.repository.save(updated);
    }
}
