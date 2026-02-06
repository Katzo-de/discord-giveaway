import { ModalSubmitInteraction } from 'discord.js';
import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { recurringService } from '../../container';
import { parseDuration } from '../../utils/timeUtils';

const modal: Modal = {
    customId: 'schedule_giveaway_modal',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        // CustomID format: schedule_giveaway_modal:templateId
        const parts = interaction.customId.split(':');
        const templateId = parseInt(parts[1]);

        if (isNaN(templateId)) {
            await interaction.reply({ content: 'Invalid template ID.', ephemeral: true });
            return;
        }

        const intervalStr = interaction.fields.getTextInputValue('interval_input');
        const winnersStr = interaction.fields.getTextInputValue('winners_input');

        const intervalMs = parseDuration(intervalStr);
        if (!intervalMs || intervalMs < 60000) { // Min 1 minute
            await interaction.reply({ content: 'Invalid interval. Used format like "1d", "12h". Min 1m.', ephemeral: true });
            return;
        }

        const winners = parseInt(winnersStr);
        if (isNaN(winners) || winners < 1) {
            await interaction.reply({ content: 'Invalid winner count.', ephemeral: true });
            return;
        }

        if (!interaction.guildId || !interaction.channelId) return;

        try {
            await recurringService.createRecurringGiveaway({
                guild_id: interaction.guildId,
                template_id: templateId,
                channel_id: interaction.channelId,
                interval_ms: intervalMs,
                winners_count: winners,
                hosted_by: interaction.user.id
            });

            await interaction.reply({ content: `Recurring giveaway scheduled! Interval: ${intervalStr}, Winners: ${winners}.`, ephemeral: true });
        } catch (error) {
            console.error('Error scheduling giveaway:', error);
            await interaction.reply({ content: 'Failed to schedule giveaway.', ephemeral: true });
        }
    }
};

export default modal;
