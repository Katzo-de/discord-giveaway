import { Client, GatewayIntentBits } from 'discord.js';
import { InteractionHandler } from './handlers/InteractionHandler';
import { EventHandler } from './handlers/EventHandler';

export class Bot extends Client {
    public interactionHandler: InteractionHandler;
    public eventHandler: EventHandler;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });

        this.interactionHandler = new InteractionHandler(this);
        this.eventHandler = new EventHandler(this);
    }

    public async start(): Promise<void> {
        await this.login(process.env.DISCORD_TOKEN);

        await this.interactionHandler.loadInteractions();
        await this.eventHandler.loadEvents();
    }
}
