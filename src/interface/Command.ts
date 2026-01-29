import { CommandInteraction, SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { Bot } from '../Bot';

export interface Command {
    data: SlashCommandBuilder;
    execute: (client: Bot, interaction: ChatInputCommandInteraction) => Promise<any>;
    autocomplete?: (client: Bot, interaction: AutocompleteInteraction) => Promise<any>;
}
