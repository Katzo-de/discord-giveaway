
import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction, ActionRowBuilder } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';

const modal: Modal = {
    customId: 'giveaway_advanced',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1]);

        if (isNaN(giveawayId)) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const winnersInput = interaction.fields.getTextInputValue('winners');
        const pingRoleInput = interaction.fields.getTextInputValue('ping_role');

        let winners = parseInt(winnersInput);
        if (isNaN(winners) || winners < 1) {
            winners = 1;
        }

        let pingRoleId: string | null = null;
        if (pingRoleInput) {
            if (pingRoleInput.toLowerCase() === 'create') {
                try {
                    // Create a new role
                    const role = await interaction.guild?.roles.create({
                        name: 'Giveaway Ping',
                        reason: `Created for giveaway ${giveawayId}`
                    });
                    if (role) {
                        pingRoleId = role.id;
                    }
                } catch (err) {
                    console.error('Failed to create role:', err);
                    await interaction.reply({ content: 'Failed to create role automatically.', flags: MessageFlags.Ephemeral });
                    return;
                }
            } else {
                // assume it's an ID
                pingRoleId = pingRoleInput.replace(/[^0-9]/g, '');
            }
        }

        try {
            // Fetch ID check to verify existence
            const giveaway = await giveawayService.getGiveaway(giveawayId);

            if (!giveaway) {
                await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Update settings
            giveaway.winners = winners;
            if (pingRoleId) {
                giveaway.ping_role_id = pingRoleId; // Now entity has it
            }
            await giveawayService.updateGiveaway(giveaway);

            // Get channel
            const channel = await client.channels.fetch(giveaway.channel_id);
            if (!channel || !channel.isSendable()) {
                await interaction.reply({ content: 'Channel not found or bot cannot send messages.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Create Container
            const container = createGiveawayContainer(
                giveaway.title,
                giveaway.description,
                giveaway.prize,
                giveaway.end_time,
                giveaway.hosted_by,
                0,
                giveaway.id,
                winners
            );

            // Buttons for Preview
            const confirmButton = new ButtonBuilder()
                .setCustomId(`giveaway_confirm:${giveaway.id}`)
                .setLabel('Confirm & Publish')
                .setStyle(ButtonStyle.Success);

            const editButton = new ButtonBuilder()
                .setCustomId(`giveaway_edit:${giveaway.id}`)
                .setLabel('Edit Settings')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, editButton);

            let content = `**Preview of your giveaway:**\n\n`;
            if (pingRoleId) {
                content += `(Pin: <@&${pingRoleId}>)\n`;
            }

            // Reply Ephemerally with Preview
            await interaction.reply({
                content: content,
                components: [container as any, row],
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while finalizing the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default modal;
