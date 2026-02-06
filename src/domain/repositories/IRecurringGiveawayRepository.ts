import { RecurringGiveaway } from '../entities/RecurringGiveaway';

export interface IRecurringGiveawayRepository {
    create(data: Omit<RecurringGiveaway, 'id'>): Promise<RecurringGiveaway>;
    getById(id: number): Promise<RecurringGiveaway | null>;
    getAllActive(): Promise<RecurringGiveaway[]>;
    update(recurring: RecurringGiveaway): Promise<void>;
    delete(id: number): Promise<void>;
    getByGuildId(guildId: string): Promise<RecurringGiveaway[]>;
}
