import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'wizard_step_3',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', ephemeral: true });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`wizard_step:step3:${draftId}`)
            .setTitle('Step 3: Scheduling');

        const scheduleInput = new TextInputBuilder()
            .setCustomId('schedule')
            .setLabel("Schedule (Cron or 'Daily', 'Weekly') - Optional")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        // TODO: Load existing schedule if present in draft (need to add schedule field to GiveawayData?)

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(scheduleInput)
        ];

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default button;
