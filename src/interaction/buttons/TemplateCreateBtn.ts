import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';

const templateCreateBtn: Button = {
    customId: 'template_create_btn',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId('template_create_modal')
            .setTitle('Create Giveaway Template');

        const nameInput = new TextInputBuilder()
            .setCustomId('template_name')
            .setLabel("Template Name (Unique)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const titleInput = new TextInputBuilder()
            .setCustomId('template_title')
            .setLabel("Giveaway Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('template_description')
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const prizeInput = new TextInputBuilder()
            .setCustomId('template_prize')
            .setLabel("Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('template_duration')
            .setLabel("Default Duration (e.g. 1h, 30m) (Optional)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput)
        );

        await interaction.showModal(modal);
    }
};

export default templateCreateBtn;
