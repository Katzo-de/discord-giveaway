import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { endGiveaway } from '../../utils/giveawayUtils';

const command: Command = {
    data: (new SlashCommandBuilder()
        .setName('gend')
        .setDescription('Ends a giveaway immediately')
        .addIntegerOption(option =>
            option.setName('giveaway_id')
                .setDescription('The ID of the giveaway to end')
                .setRequired(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        // Message: "Giveaway wird ausgelöst..."
        await interaction.reply({ content: 'Giveaway wird ausgelöst...' });

        const result = await endGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.followUp({ content: result.message, allowedMentions: result.winnerId ? { users: [result.winnerId] } : undefined });
        } else {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
