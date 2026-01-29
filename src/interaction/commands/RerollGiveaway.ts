import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { rerollGiveaway } from '../../utils/giveawayUtils';

const command: Command = {
    data: (new SlashCommandBuilder()
        .setName('greroll')
        .setDescription('Reroll a giveaway winner')
        .addIntegerOption(option =>
            option.setName('giveaway_id')
                .setDescription('The ID of the giveaway to reroll')
                .setRequired(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        const result = await rerollGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.reply({ content: result.message, allowedMentions: result.winnerId ? { users: [result.winnerId] } : undefined });
        } else {
            await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
