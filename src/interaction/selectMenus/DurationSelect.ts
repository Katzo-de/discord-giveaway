import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuInteraction } from 'discord.js';

const selectMenu: SelectMenu = {
    customId: 'giveaway_duration',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        const duration = interaction.values[0];
        const isCustom = duration === 'Custom';
        const isDate = duration === 'Date';

        // Encode duration in customId: giveaway_create:<duration>
        const modalCustomId = `giveaway_create:${duration}`;

        const modal = new ModalBuilder()
            .setCustomId(modalCustomId)
            .setTitle('Create Giveaway');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Giveaway Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel("Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput)
        ];

        if (isCustom) {
            const durationInput = new TextInputBuilder()
                .setCustomId('custom_duration')
                .setLabel("Custom Duration (e.g. 30m, 1d)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput));
        } else if (isDate) {
            const dateInput = new TextInputBuilder()
                .setCustomId('date_input')
                .setLabel("Date (DD.MM)")
                .setPlaceholder("31.12")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const timeInput = new TextInputBuilder()
                .setCustomId('time_input')
                .setLabel("Time (HH:mm)")
                .setPlaceholder("23:59")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput));
            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput));
        }

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default selectMenu;
