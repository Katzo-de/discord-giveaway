import { GiveawayTemplate } from '../../domain/entities/GiveawayTemplate';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';

export class TemplateService {
    constructor(private readonly repository: ITemplateRepository) { }

    async createTemplate(templateData: Omit<GiveawayTemplate, 'id' | 'created_at'>): Promise<void> {
        // Validate? (e.g. check duplicate name)
        const existing = await this.repository.get(templateData.guild_id, templateData.name);
        if (existing) {
            throw new Error(`Template with name "${templateData.name}" already exists.`);
        }
        await this.repository.create(templateData);
    }

    async getTemplates(guildId: string): Promise<GiveawayTemplate[]> {
        return this.repository.getAll(guildId);
    }

    async getTemplate(guildId: string, name: string): Promise<GiveawayTemplate | null> {
        return this.repository.get(guildId, name);
    }

    async getTemplateById(id: number): Promise<GiveawayTemplate | null> {
        return this.repository.getById(id);
    }

    async deleteTemplate(guildId: string, name: string): Promise<void> {
        await this.repository.delete(guildId, name);
    }
}
