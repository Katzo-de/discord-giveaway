import { Client, GatewayIntentBits } from 'discord.js';
import { InteractionHandler } from './handlers/InteractionHandler';
import { EventHandler } from './handlers/EventHandler';

import { GiveawayWorker } from './workers/GiveawayWorker';

export class Bot extends Client {
    public interactionHandler: InteractionHandler;
    public eventHandler: EventHandler;
    // public database: IDatabase; // Removed
    public giveawayWorker: GiveawayWorker;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });

        this.interactionHandler = new InteractionHandler(this);
        this.eventHandler = new EventHandler(this);
        // this.database removed. Use Services via Dependency Injection container.
        this.giveawayWorker = new GiveawayWorker(this);
    }

    public async start(): Promise<void> {
        await this.login(process.env.DISCORD_TOKEN);

        await this.interactionHandler.loadInteractions();
        await this.eventHandler.loadEvents();

        this.giveawayWorker.start();
    }
}
