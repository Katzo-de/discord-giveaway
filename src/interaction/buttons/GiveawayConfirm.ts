
import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';
import { giveawayCache } from '../../utils/GiveawayCache';

const button: Button = {
    customId: 'giveaway_confirm',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        // Defer update immediately to prevent timeout or race conditions
        await interaction.deferUpdate();

        const parts = interaction.customId.split(':');
        const draftId = parts[1]; // UUID

        if (!draftId) {
            await interaction.followUp({ content: 'Invalid giveaway session.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Fetch keys from Cache
            const draft = giveawayCache.get(draftId);

            if (!draft) {
                await interaction.followUp({ content: 'Giveaway session expired. Please start over.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Get channel
            const channel = await client.channels.fetch(draft.channelId);
            if (!channel || !channel.isSendable()) {
                await interaction.followUp({ content: 'Channel not found or bot cannot send messages.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Create REAL Giveaway in Database
            const giveaway = await giveawayService.createGiveaway({
                message_id: 'PENDING', // Will update below
                channel_id: draft.channelId,
                guild_id: draft.guildId,
                title: draft.title,
                description: draft.description,
                prize: draft.prize,
                end_time: draft.endTime,
                hosted_by: draft.hostedBy,
                winners: draft.winners || 1,
                ping_role_id: draft.pingRoleId
            });

            if (!giveaway) {
                await interaction.followUp({ content: 'Failed to create giveaway in database.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Create Container with REAL ID
            const container = createGiveawayContainer(
                giveaway.title,
                giveaway.description,
                giveaway.prize,
                giveaway.end_time,
                giveaway.hosted_by,
                0,
                giveaway.id,
                giveaway.winners || 1
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

            // Publish Message
            if (giveaway.ping_role_id) {
                await channel.send({
                    content: `<@&${giveaway.ping_role_id}>`
                });
            }

            const sentMessage = await channel.send({
                components: [container as any, row],
                flags: MessageFlags.IsComponentsV2
            });

            // Update Message ID
            console.log(`[Confirm] Giveaway ${giveaway.id} published. Message ID: ${sentMessage.id}`);
            giveaway.message_id = sentMessage.id;
            await giveawayService.updateGiveaway(giveaway);

            // Clear Cache
            giveawayCache.delete(draftId);

            const successContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('✅ **Giveaway published successfully!**')
                );

            await interaction.editReply({
                content: null,
                embeds: [],
                components: [successContainer as any]
            });

        } catch (error) {
            console.error('Error confirming giveaway:', error);
            await interaction.followUp({ content: 'An error occurred while publishing the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
