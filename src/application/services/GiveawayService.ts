import { Giveaway } from '../../domain/entities/Giveaway';
import { IGiveawayRepository } from '../../domain/repositories/IGiveawayRepository';

export class GiveawayService {
    constructor(private readonly repository: IGiveawayRepository) { }

    async createGiveaway(data: Omit<Giveaway, 'id' | 'created_at' | 'ended'>): Promise<Giveaway> {
        // Here we could add logic like max active giveaways per guild etc.
        return this.repository.create(data);
    }

    async getGiveaway(id: number): Promise<Giveaway | null> {
        return this.repository.getById(id);
    }

    async getGiveawayByMessageId(messageId: string): Promise<Giveaway | null> {
        return this.repository.getByMessageId(messageId);
    }

    async joinGiveaway(giveawayId: number, userId: string): Promise<boolean> {
        const giveaway = await this.repository.getById(giveawayId);
        if (!giveaway) {
            throw new Error('Giveaway not found');
        }
        if (giveaway.ended) {
            throw new Error('Giveaway has ended');
        }

        return this.repository.addEntry(giveawayId, userId);
    }

    async endGiveaway(giveawayId: number): Promise<string[]> {
        const giveaway = await this.repository.getById(giveawayId);
        if (!giveaway) {
            throw new Error('Giveaway not found');
        }
        if (giveaway.ended) {
            // Already ended, return existing winners? Or empty?
            // For now throw or just return empty
            return [];
        }

        // Logic to pick winners
        const entries = await this.repository.getEntries(giveawayId);
        const winnersCount = Math.min(giveaway.winners, entries.length);

        // Secure shuffle/random selection should go here or in a Utils
        // For simplicity using simple shuffle for now, or assume Repository handles random pick?
        // Service should handle business logic of "who wins".
        const winners = this.pickRandomWinners(entries, winnersCount);

        // Update giveaway status
        giveaway.ended = true;
        await this.repository.update(giveaway);

        return winners;
    }

    async rerollGiveaway(giveawayId: number, count: number = 1): Promise<string[]> {
        const giveaway = await this.repository.getById(giveawayId);
        if (!giveaway) {
            throw new Error('Giveaway not found');
        }
        if (!giveaway.ended) {
            throw new Error('Giveaway has not ended yet');
        }

        const entries = await this.repository.getEntries(giveawayId);
        return this.pickRandomWinners(entries, count);
    }

    private pickRandomWinners(entries: string[], count: number): string[] {
        if (entries.length === 0) return [];
        // Fisher-Yates shuffle
        const shuffled = [...entries];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    async getEndedGiveaways(): Promise<Giveaway[]> {
        return this.repository.getEndingBefore(new Date());
    }

    async search(query: string, ended: boolean): Promise<Giveaway[]> {
        return this.repository.search(query, ended);
    }

    async deleteGiveaway(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async getEntries(id: number): Promise<string[]> {
        return this.repository.getEntries(id);
    }

    async getEntryCount(id: number): Promise<number> {
        return this.repository.countEntries(id);
    }

    async updateGiveaway(giveaway: Giveaway): Promise<void> {
        await this.repository.update(giveaway);
    }
}
