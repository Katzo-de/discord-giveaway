import { ClientEvents } from 'discord.js';
import { Bot } from '../Bot';

export interface Event<K extends keyof ClientEvents> {
    name: K;
    once?: boolean;
    execute: (client: Bot, ...args: ClientEvents[K]) => Promise<any> | any;
}
