import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AutocompleteInteraction } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { endGiveaway } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';

const command: Command = {
    data: (new SlashCommandBuilder()
        .setName('gend')
        .setDescription('Ends a giveaway immediately')
        .addIntegerOption(option =>
            option.setName('giveaway_id')
                .setDescription('The ID of the giveaway to end')
                .setRequired(true)
                .setAutocomplete(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        // Message: "Giveaway wird ausgelöst..."
        await interaction.reply({ content: 'Giveaway wordt beëindigd...' }); // Fixed language to generic or whatever it was

        const result = await endGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.followUp({ content: result.message, allowedMentions: result.winnerIds ? { users: result.winnerIds } : undefined });
        } else {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    },
    autocomplete: async (client, interaction) => {
        const focusedValue = interaction.options.getFocused();

        // Find active giveaways matches
        try {
            const giveaways = await giveawayService.search(focusedValue.toString(), false);

            const choices = giveaways.map(g => ({ name: `[ID: ${g.id}] ${g.title}`, value: g.id }));
            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error in gend:', error);
            await interaction.respond([]);
        }
    }
};

export default command;
