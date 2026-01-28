import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { MessageFlags, ButtonInteraction } from 'discord.js';

const button: Button = {
    customId: 'join_giveaway',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        if (parts.length < 2) {
             await interaction.reply({ content: 'Invalid button interaction.', flags: MessageFlags.Ephemeral });
             return;
        }
        const giveawayId = parts[1];
        const userId = interaction.user.id;

        try {
            const rows = await client.database.query('SELECT ended FROM giveaways WHERE id = ?', [giveawayId]);
            const giveaway = rows && rows[0];

            if (!giveaway) {
                 await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                 return;
            }
            if (giveaway.ended) {
                await interaction.reply({ content: 'This giveaway has already ended!', flags: MessageFlags.Ephemeral });
                return;
            }

            const entryRows = await client.database.query(
                'SELECT id FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?',
                [giveawayId, userId]
            );
            const existingEntry = entryRows && entryRows[0];

            if (existingEntry) {
                await interaction.reply({ content: 'You have already joined this giveaway!', flags: MessageFlags.Ephemeral });
                return;
            }

            await client.database.execute(
                'INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES (?, ?)',
                [giveawayId, userId]
            );

            await interaction.reply({ content: '🎉 You have successfully joined the giveaway!', flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while joining the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
