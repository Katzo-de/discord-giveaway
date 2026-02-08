import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'wizard_step_1',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        // Parse customId: wizard_step_1:draftId
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
            .setCustomId(`wizard_step:step1:${draftId}`)
            .setTitle('Step 1: Basic Info');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Giveaway Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        if (draft.title) titleInput.setValue(draft.title);

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel("Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        if (draft.prize) prizeInput.setValue(draft.prize);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        if (draft.description) descriptionInput.setValue(draft.description);

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        ];

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default button;
