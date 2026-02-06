import { ActionRowBuilder, ModalBuilder, StringSelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';

const selectMenu: SelectMenu = {
    customId: 'schedule_template_select',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        const templateId = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`schedule_giveaway_modal:${templateId}`)
            .setTitle('Schedule Giveaway');

        const intervalInput = new TextInputBuilder()
            .setCustomId('interval_input')
            .setLabel('Interval (e.g. 1d, 12h)')
            .setPlaceholder('24h')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners_input')
            .setLabel('Number of Winners')
            .setValue('1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(intervalInput);
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    }
};

export default selectMenu;
