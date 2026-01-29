import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, AutocompleteInteraction } from 'discord.js';
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
                .setAutocomplete(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        await interaction.deferReply();

        const result = await rerollGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.followUp({ content: result.message, allowedMentions: result.winnerId ? { users: [result.winnerId] } : undefined });
        } else {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    },
    autocomplete: async (client, interaction) => {
        const focusedValue = interaction.options.getFocused();
        const db = client.database;

        try {
            // Reroll is for ended giveaways
            const giveaways = await db.query(
                'SELECT id, title FROM giveaways WHERE ended = 1 AND title LIKE ? LIMIT 25',
                [`%${focusedValue}%`]
            ) as { id: number, title: string }[];

            const choices = giveaways.map(g => ({ name: `[ID: ${g.id}] ${g.title}`, value: g.id }));
            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error in greroll:', error);
            await interaction.respond([]);
        }
    }
};

export default command;
