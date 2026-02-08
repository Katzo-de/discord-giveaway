import { Bot } from '../Bot';
import { v4 as uuidv4 } from 'uuid';

export interface GiveawayData {
    // Basic Info
    title?: string;
    description?: string;
    prize?: string;
    endTime?: Date;
    hostedBy: string; // User ID
    channelId: string;
    guildId: string;

    // Advanced Info
    winners?: number;
    durationMs?: number;
    pingRoleId?: string;

    // Status
    step?: number;
    wizardMessageId?: string;
}

class TemporaryGiveawayCache {
    private cache: Map<string, GiveawayData> = new Map();
    private timeouts: Map<string, NodeJS.Timeout> = new Map();
    private readonly TTL_MS = 1000 * 60 * 15; // 15 Minutes TTL
    private client: Bot | null = null;

    init(client: Bot) {
        this.client = client;
    }

    save(data: GiveawayData, existingId?: string): string {
        const id = existingId || uuidv4();

        // Clear existing timeout if updating
        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id)!);
        }

        this.cache.set(id, data);

        // Set new timeout
        const timeout = setTimeout(async () => {
            // We cannot easily delete ephemeral messages from here without the interaction token/hook.
            // Channel.messages.fetch() fails for ephemeral messages.
            // So we just clear the cache. The ephemeral message will stay until dismissed or restart.

            if (this.cache.has(id)) {
                this.cache.delete(id);
                this.timeouts.delete(id);
            }
        }, this.TTL_MS);

        this.timeouts.set(id, timeout);

        return id;
    }

    get(id: string): GiveawayData | undefined {
        return this.cache.get(id);
    }

    delete(id: string): boolean {
        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id)!);
            this.timeouts.delete(id);
        }
        return this.cache.delete(id);
    }
}

export const giveawayCache = new TemporaryGiveawayCache();
