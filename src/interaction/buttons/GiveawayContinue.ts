
import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, LabelBuilder, MessageFlags } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'giveaway_continue',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];

        const giveawayData = giveawayCache.get(draftId);

        if (!giveawayData) {
            await interaction.reply({
                content: 'Giveaway session expired or not found. Please start over.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`giveaway_advanced:${draftId}`)
            .setTitle('Giveaway Settings');

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('1')
            .setRequired(false);

        const winnersInputLabel = new LabelBuilder()
            .setLabel('Number of Winners')
            .setTextInputComponent(winnersInput);

        let roleSelectionOptions = interaction.guild?.roles.cache
            .filter(role => !role.permissions.has('Administrator'))
            .filter(role => role.mentionable)
            .map(role => new StringSelectMenuOptionBuilder()
                .setLabel(`@${role.name}`.slice(0, 100))
                .setValue(role.id)
                .setEmoji('🎉')) || [];

        // Safety: Discord allows max 25 options
        if (roleSelectionOptions.length > 25) {
            roleSelectionOptions = roleSelectionOptions.slice(0, 25);
        }

        // Safety: Discord requires at least 1 option
        if (roleSelectionOptions.length === 0) {
            roleSelectionOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel('No suitable roles found')
                    .setValue('error_no_roles')
                    .setEmoji('⚠️')
                    .setDescription('Please make sure you have mentionable non-admin roles.')
            );
        }

        const roleSelect = new StringSelectMenuBuilder()
            .setCustomId('ping_role')
            .setPlaceholder('Select a role')
            .setRequired(false) // Allow skipping if strictly necessary, or keep true
            .addOptions(
                ...roleSelectionOptions
            );

        const roleSelectLabel = new LabelBuilder()
            .setLabel('Select a role')
            .setStringSelectMenuComponent(roleSelect);

        modal.addLabelComponents(winnersInputLabel);
        modal.addLabelComponents(roleSelectLabel);

        await interaction.showModal(modal);
    }
};

export default button;
