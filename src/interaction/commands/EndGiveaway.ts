import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AutocompleteInteraction } from 'discord.js';
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
                .setAutocomplete(true)
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
    },
    autocomplete: async (client, interaction) => {
        const focusedValue = interaction.options.getFocused();
        const db = client.database;

        // Find active giveaways matches
        // Note: Check if focusedValue is a number or string. 
        // If user typed "Test", we search title. If "1", we search ID or title? 
        // Let's search title mostly.

        try {
            const giveaways = await db.query(
                'SELECT id, title FROM giveaways WHERE ended = 0 AND title LIKE ? LIMIT 25',
                [`%${focusedValue}%`]
            ) as { id: number, title: string }[];

            const choices = giveaways.map(g => ({ name: `[ID: ${g.id}] ${g.title}`, value: g.id }));
            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error in gend:', error);
            await interaction.respond([]);
        }
    }
};

export default command;
