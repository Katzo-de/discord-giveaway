import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(option => 
            option.setName('echo')
                .setDescription('The message to echo back')
                .setRequired(false)
        ) as SlashCommandBuilder,
    execute: async (client: Bot, interaction) => {
        const echo = interaction.options.getString('echo');
        if (echo) {
            await interaction.reply({ content: `Pong! You said: ${echo}`, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
