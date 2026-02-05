import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { giveawayService } from '../../container';

const button: Button = {
    customId: 'giveaway_end',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        // Parse giveaway ID
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1]);

        if (isNaN(giveawayId)) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Check Permissions
        // User must be 'Administrator' or the Host of the giveaway.
        // For simplicity, we can just check if they are Admin or if they created it.
        // We'd need to fetch the giveaway to know who created it.

        try {
            const giveaway = await giveawayService.getGiveaway(giveawayId);

            if (!giveaway) {
                await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                return;
            }

            const isHost = giveaway.hosted_by === interaction.user.id;
            const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
                interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild); // Or ManageMessages as per command

            if (!isHost && !isAdmin) {
                await interaction.reply({ content: 'You do not have permission to end this giveaway.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Confirmation
            const confirmButton = new ButtonBuilder()
                .setCustomId(`giveaway_end_confirm:${giveawayId}`)
                .setLabel('Confirm End')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId(`giveaway_cancel:${giveawayId}`) // We can handle this or just let the ephemeral expire/dismiss
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            await interaction.reply({
                content: 'Are you sure you want to end this giveaway?',
                components: [row],
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('Error in giveaway_end:', error);
            await interaction.reply({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
