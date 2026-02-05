import { Giveaway, GiveawayEntry } from '../entities/Giveaway';

export interface IGiveawayRepository {
    create(giveaway: Omit<Giveaway, 'id' | 'created_at' | 'ended'>): Promise<Giveaway>;
    getById(id: number): Promise<Giveaway | null>;
    getByMessageId(messageId: string): Promise<Giveaway | null>;
    getActive(guildId: string): Promise<Giveaway[]>;
    getAllActive(): Promise<Giveaway[]>; // For check-tasks
    update(giveaway: Giveaway): Promise<void>;

    addEntry(giveawayId: number, userId: string): Promise<boolean>;
    countEntries(giveawayId: number): Promise<number>;
    getEntries(giveawayId: number): Promise<string[]>; // Returns user IDs

    // Potentially helper methods
    delete(id: number): Promise<void>;

    getEndingBefore(date: Date): Promise<Giveaway[]>;
    search(query: string, ended: boolean): Promise<Giveaway[]>;
}
