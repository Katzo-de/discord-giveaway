import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';

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

        try {
            const db = client.database;
            
            // Fetch giveaway
            const giveawayRows = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
            const giveaway = giveawayRows && giveawayRows[0];

            if (!giveaway) {
                await interaction.reply({ content: `Giveaway with ID ${giveawayId} not found.`, flags: MessageFlags.Ephemeral });
                return;
            }

            // Fetch entries
            const entries = await db.query('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);

            if (!entries || entries.length === 0) {
                await interaction.reply({ content: 'No entries found for this giveaway.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Pick random winner
            const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
            const winnerId = winnerEntry.user_id;

            await interaction.reply({ content: `🎉 The new winner is <@${winnerId}>! Congratulations!`, allowedMentions: { users: [winnerId] } });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while rerolling the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
