
import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction, ActionRowBuilder, ComponentType } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayCache } from '../../utils/GiveawayCache';

const modal: Modal = {
    customId: 'giveaway_advanced',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parts[1]; // UUID string

        if (!giveawayId) {
            await interaction.reply({ content: 'Invalid giveaway session.', flags: MessageFlags.Ephemeral });
            return;
        }

        const winnersInput = interaction.fields.getTextInputValue('winners');

        // Get Role Select Menu Value
        let pingRoleId: string | null = null;
        try {
            // We use getField to access the Select Menu component data
            // In Discord.js, accessing a Select Menu value from a Modal submission can be tricky depending on version helper availability.
            // But generically: interaction.fields.fields.get('ping_role') should have it.
            // Or using the typed helper if available.
            // For safety, we can look at the raw values if getField is finicky, but getField is standard.
            const roleField = interaction.fields.fields.get('ping_role') as any;
            if (roleField && roleField.type === ComponentType.RoleSelect && roleField.values && roleField.values.length > 0) {
                pingRoleId = roleField.values[0];
            }
        } catch (err) {
            console.warn("Could not retrieve ping_role from modal fields", err);
        }

        let winners = parseInt(winnersInput);
        if (isNaN(winners) || winners < 1) {
            winners = 1;
        }

        try {
            // Fetch from Cache
            const giveaway = giveawayCache.get(giveawayId); // giveawayId is actually UUID string here

            if (!giveaway) {
                await interaction.reply({ content: 'Giveaway session expired. Please start over.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Update settings in Cache
            giveaway.winners = winners;
            giveaway.pingRoleId = pingRoleId || undefined;

            // Save back to cache (refresh TTL)
            giveawayCache.save(giveaway, giveawayId);

            // Create Container Preview
            const container = createGiveawayContainer(
                giveaway.title,
                giveaway.description,
                giveaway.prize,
                giveaway.endTime,
                giveaway.hostedBy,
                0,
                0, // ID 0 for preview
                winners
            );

            // Buttons for Preview
            const confirmButton = new ButtonBuilder()
                .setCustomId(`giveaway_confirm:${giveawayId}`)
                .setLabel('Confirm & Publish')
                .setStyle(ButtonStyle.Success);

            const editButton = new ButtonBuilder()
                .setCustomId(`giveaway_edit:${giveawayId}`)
                .setLabel('Edit Settings')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, editButton);

            let content = `**Preview of your giveaway:**\n\n`;
            if (giveaway.pingRoleId) {
                content += `(Pin: <@&${giveaway.pingRoleId}>)\n`;
            }

            // Reply Ephemerally with Preview
            await interaction.reply({
                // content: content, 
                components: [container as any, row],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error(error);
            // Check if already replied
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while finalizing the giveaway.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};

export default modal;
