import { GiveawayTemplate } from '../entities/GiveawayTemplate';

export interface ITemplateRepository {
    create(template: Omit<GiveawayTemplate, 'id' | 'created_at'>): Promise<void>;
    getAll(guildId: string): Promise<GiveawayTemplate[]>;
    get(guildId: string, name: string): Promise<GiveawayTemplate | null>;
    getById(id: number): Promise<GiveawayTemplate | null>;
    delete(guildId: string, name: string): Promise<void>;
}
