import { Bot } from '../Bot';
import { Event } from '../interface/Event';
import * as fs from 'fs';
import * as path from 'path';

export class EventHandler {
    constructor(private client: Bot) {}

    public async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
        
        if (!fs.existsSync(eventsPath)) return;

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const { default: event } = await import(filePath);
            
            if (!event || !event.name || !event.execute) continue;

            const typedEvent = event as Event<any>;

            if (typedEvent.once) {
                this.client.once(typedEvent.name, (...args) => typedEvent.execute(this.client, ...args));
            } else {
                this.client.on(typedEvent.name, (...args) => typedEvent.execute(this.client, ...args));
            }
        }
    }
}
