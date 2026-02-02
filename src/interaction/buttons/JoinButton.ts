import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { MessageFlags, ButtonInteraction, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';

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

            // Fetch new participant count
            const countRows = await client.database.query(
                'SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?',
                [giveawayId]
            );
            const participantCount = countRows ? (countRows[0] as any).count : 0;

            // Fetch all giveaway details to rebuild the message
            // We already have 'giveaway' from the earlier check, but let's make sure we have all fields
            // The earlier select was 'SELECT ended FROM ...'. We need more fields now.
            const fullGiveawayRows = await client.database.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
            const fullGiveaway = fullGiveawayRows && fullGiveawayRows[0];

            if (fullGiveaway) {
                try {
                    const channel = await client.channels.fetch(fullGiveaway.channel_id);
                    if (channel && channel.isSendable()) {
                        const message = await channel.messages.fetch(fullGiveaway.message_id).catch(() => null);
                        if (message) {
                            const container = createGiveawayContainer(
                                fullGiveaway.title,
                                fullGiveaway.description,
                                fullGiveaway.prize,
                                fullGiveaway.end_time,
                                fullGiveaway.hosted_by,
                                participantCount,
                                fullGiveaway.id
                            );

                            await message.edit({
                                components: [container as any, ...message.components.slice(1)], // Keep buttons (row 1+)
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to update message for giveaway ${giveawayId} on join:`, err);
                }
            }

            await interaction.reply({ content: '🎉 You have successfully joined the giveaway!', flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while joining the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
