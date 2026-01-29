import { Bot } from '../Bot';
import { endGiveaway } from '../utils/giveawayUtils';

export class GiveawayWorker {
    private client: Bot;
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

    constructor(client: Bot) {
        this.client = client;
    }

    public start(): void {
        if (this.checkInterval) return;

        console.log('Starting GiveawayWorker...');
        this.check(); // Run immediately
        this.checkInterval = setInterval(() => this.check(), this.CHECK_INTERVAL_MS);
    }

    public stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Stopped GiveawayWorker.');
        }
    }

    private async check(): Promise<void> {
        try {
            const db = this.client.database;
            const now = new Date().toISOString();

            // 1. Check for giveaways that have ended but are not marked as ended
            // SQL: Select giveaways where end_time is in the past AND ended is 0
            const endedGiveaways = await db.query(
                'SELECT id FROM giveaways WHERE end_time <= ? AND ended = 0',
                [now]
            );

            if (endedGiveaways && endedGiveaways.length > 0) {
                console.log(`GiveawayWorker: Found ${endedGiveaways.length} giveaways to end.`);

                for (const row of endedGiveaways) {
                    await endGiveaway(this.client, row.id);
                }
            }

            // 2. Optional: Check for giveaways that are lingering or invalid/deleted if needed.
            // For now, the primary "removal" logic is just ending them.
            // If the user wants to DELETE rows for giveaways that are very old, we can add that here.
            // Example: DELETE FROM giveaways WHERE ended = 1 AND end_time < (now - 30 days)

        } catch (error) {
            console.error('GiveawayWorker Error:', error);
        }
    }
}
