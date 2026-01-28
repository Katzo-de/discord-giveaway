import { CommandInteraction, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Bot } from '../Bot';

export interface Command {
    data: SlashCommandBuilder;
    execute: (client: Bot, interaction: ChatInputCommandInteraction) => Promise<any>;
}
