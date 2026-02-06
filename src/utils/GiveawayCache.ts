import { v4 as uuidv4 } from 'uuid';

export interface GiveawayData {
    // Basic Info
    title: string;
    description: string;
    prize: string;
    endTime: Date;
    hostedBy: string; // User ID
    channelId: string;
    guildId: string;

    // Advanced Info
    winners?: number;
    pingRoleId?: string;
}

class TemporaryGiveawayCache {
    private cache: Map<string, GiveawayData> = new Map();
    private readonly TTL_MS = 1000 * 60 * 15; // 15 Minutes TTL

    save(data: GiveawayData, existingId?: string): string {
        const id = existingId || uuidv4();
        this.cache.set(id, data);

        // Reset timer / Simple cleanup (in a real app, use a cron or interval)
        // For simplicity here, we just use a timeout to delete this specific entry
        setTimeout(() => {
            if (this.cache.has(id)) {
                this.cache.delete(id);
            }
        }, this.TTL_MS);

        return id;
    }

    get(id: string): GiveawayData | undefined {
        return this.cache.get(id);
    }

    delete(id: string): boolean {
        return this.cache.delete(id);
    }
}

export const giveawayCache = new TemporaryGiveawayCache();
