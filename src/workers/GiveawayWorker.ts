import { Bot } from '../Bot';
import { endGiveaway } from '../utils/giveawayUtils';
import { giveawayService, recurringService } from '../container';

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
            // 1. Check for giveaways that have ended but are not marked as ended
            // Service handles date logic
            const endedGiveaways = await giveawayService.getEndedGiveaways();

            if (endedGiveaways && endedGiveaways.length > 0) {
                console.log(`GiveawayWorker: Found ${endedGiveaways.length} giveaways to end.`);

                for (const giveaway of endedGiveaways) {
                    await endGiveaway(this.client, giveaway.id);
                }
            }

            // 2. Check for recurring giveaways
            // We need to import recurringService. It is lazy imported at top usually, but let's check imports.
            await recurringService.processDueGiveaways(this.client);

        } catch (error) {
            console.error('GiveawayWorker Error:', error);
        }
    }
}
