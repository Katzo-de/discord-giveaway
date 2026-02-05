
import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonInteraction } from 'discord.js';

const button: Button = {
    customId: 'giveaway_continue',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parts[1];

        const modal = new ModalBuilder()
            .setCustomId(`giveaway_advanced:${giveawayId}`)
            .setTitle('Giveaway Settings');

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setLabel("Number of Winners")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('1')
            .setRequired(false);

        const roleInput = new TextInputBuilder()
            .setCustomId('ping_role')
            .setLabel("Ping Role ID (or 'create' for new)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Role ID or "create"')
            .setRequired(false);

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
        ];

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default button;
