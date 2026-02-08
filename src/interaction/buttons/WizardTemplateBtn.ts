import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'wizard_template',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Open Modal to save as template
        const modal = new ModalBuilder()
            .setCustomId(`wizard_step:template:${draftId}`)
            .setTitle('Save as Template');

        const nameInput = new TextInputBuilder()
            .setCustomId('template_name')
            .setLabel("Template Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};

export default button;
