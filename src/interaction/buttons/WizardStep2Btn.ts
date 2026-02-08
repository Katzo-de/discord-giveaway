import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'wizard_step_2',
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
            .setCustomId(`wizard_step:step2:${draftId}`)
            .setTitle('Step 2: Duration');

        const durationInput = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel("Duration (e.g. 1h, 30m) - Starts on Publish")
            .setPlaceholder("1h OR 31.12 23:59 (Starts when you click Publish)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Try to reverse-engineer duration string from endTime if needed, but we don't store the raw string.
        // We can just leave it empty or user types new one.

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setLabel("Number of Winners")
            .setStyle(TextInputStyle.Short)
            .setRequired(false) // Optional here? Or required? User said "should be done in second step". Usually required.
            .setValue(draft.winners ? draft.winners.toString() : '1');

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput)
        ];

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default button;
