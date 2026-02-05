import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { templateService } from '../../container';

const modal: Modal = {
    customId: 'template_create_modal',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        if (!interaction.guildId) return;

        const name = interaction.fields.getTextInputValue('template_name');
        const title = interaction.fields.getTextInputValue('template_title');
        const description = interaction.fields.getTextInputValue('template_description');
        const prize = interaction.fields.getTextInputValue('template_prize');
        const duration = interaction.fields.getTextInputValue('template_duration'); // Optional

        try {
            // Check if template exists
            const existing = await templateService.getTemplate(interaction.guildId, name);
            if (existing) {
                await interaction.reply({ content: `A template with the name "${name}" already exists. Please choose a different name.`, flags: MessageFlags.Ephemeral });
                return;
            }

            await templateService.createTemplate({
                guild_id: interaction.guildId,
                name: name,
                title: title,
                description: description,
                prize: prize,
                duration: duration || ''
            });

            await interaction.reply({ content: `Template "${name}" created successfully!`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while creating the template.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default modal;
