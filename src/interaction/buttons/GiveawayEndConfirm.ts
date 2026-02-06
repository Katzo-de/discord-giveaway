import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { endGiveaway } from '../../utils/giveawayUtils';

const button: Button = {
    customId: 'giveaway_end_confirm',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1], 10);

        if (!giveawayId) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        // We already checked permissions in the previous step. 
        // Technically we should check again implicitly or trust the customId flow (ephemeral to authorized user).
        // Since it's ephemeral, only the user who clicked "End" sees this button.

        await interaction.update({ content: 'Ending giveaway...', components: [] });

        const result = await endGiveaway(client, giveawayId);

        if (result.success) {
            console.log(`[GiveawayEndConfirm] Giveaway ${giveawayId} ended successfully. Result:`, result);
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });

            // Try to confirm publicly if possible (redundant if utils handled it, but good for debug)
            if (interaction.channel && interaction.channel.isSendable()) {
                /* 
                 * Note: `endGiveaway` util function already attempts to send the winner announcement.
                 * We don't need to duplicate it here unless we want a separate confirmation message.
                 * Leaving this commented out to avoid double keys, but logging is added above.
                 */
                // await interaction.channel.send({ content: result.message, allowedMentions: result.winnerIds ? { users: result.winnerIds } : undefined });
            }

        } else {
            console.warn(`[GiveawayEndConfirm] Failed to end giveaway ${giveawayId}. Reason: ${result.message}`);
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
