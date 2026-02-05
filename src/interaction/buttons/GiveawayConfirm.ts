
import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';

const button: Button = {
    customId: 'giveaway_confirm',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1]);

        if (isNaN(giveawayId)) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Fetch giveaway
            const giveaway = await giveawayService.getGiveaway(giveawayId);

            if (!giveaway) {
                await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                return;
            }

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
                giveaway.winners
            );

            // Buttons
            const joinButton = new ButtonBuilder()
                .setCustomId(`join_giveaway:${giveaway.id}`)
                .setLabel('🎉 Join')
                .setStyle(ButtonStyle.Success);

            const endButton = new ButtonBuilder()
                .setCustomId(`giveaway_end:${giveaway.id}`)
                .setLabel('End')
                .setStyle(ButtonStyle.Danger);

            const rerollButton = new ButtonBuilder()
                .setCustomId(`giveaway_reroll:${giveaway.id}`)
                .setLabel('Reroll')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(joinButton, endButton, rerollButton);

            let content = '';
            if (giveaway.ping_role_id) {
                content = `<@&${giveaway.ping_role_id}>`;
            }

            // Publish Message
            const sentMessage = await channel.send({
                content: content || undefined,
                components: [container as any, row],
                flags: MessageFlags.IsComponentsV2
            });

            // Update Message ID and set ended = 0 (Active)
            giveaway.message_id = sentMessage.id;
            giveaway.ended = false;
            await giveawayService.updateGiveaway(giveaway);

            await interaction.update({ content: 'Giveaway published successfully!', components: [] });

        } catch (error) {
            console.error('Error confirming giveaway:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while publishing the giveaway.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.followUp({ content: 'An error occurred while publishing the giveaway.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};

export default button;
