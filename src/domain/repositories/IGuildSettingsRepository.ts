import { GuildSettings } from '../entities/GuildSettings';

export interface IGuildSettingsRepository {
    get(guildId: string): Promise<GuildSettings | null>;
    save(settings: GuildSettings): Promise<void>;
}
