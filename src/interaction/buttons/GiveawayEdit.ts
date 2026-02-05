import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { giveawayService } from '../../container';

const button: Button = {
    customId: 'giveaway_edit',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1]);

        if (isNaN(giveawayId)) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            const giveaway = await giveawayService.getGiveaway(giveawayId);

            if (!giveaway) {
                await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId(`giveaway_advanced:${giveawayId}`)
                .setTitle('Edit Giveaway Settings');

            const winnersInput = new TextInputBuilder()
                .setCustomId('winners')
                .setLabel("Number of Winners")
                .setStyle(TextInputStyle.Short)
                .setValue(giveaway.winners ? giveaway.winners.toString() : '1')
                .setRequired(false);

            const roleInput = new TextInputBuilder()
                .setCustomId('ping_role')
                .setLabel("Ping Role ID (or 'create' for new)")
                .setStyle(TextInputStyle.Short)
                .setValue(giveaway.ping_role_id || '')
                .setPlaceholder('Role ID or "create"')
                .setRequired(false);

            const rowsComponents = [
                new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
            ];

            modal.addComponents(...rowsComponents);

            await interaction.showModal(modal);

        } catch (error) {
            console.error('Error editing giveaway:', error);
            await interaction.reply({ content: 'An error occurred while fetching giveaway details.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
