import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';
import { giveawayService, settingsService } from '../../container';
import { createGiveawayContainer } from '../../utils/giveawayUtils';

const button: Button = {
    customId: 'wizard_publish',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Validate
        if (!draft.title || !draft.prize || !draft.endTime || !draft.winners) {
            await interaction.reply({ content: 'Draft is incomplete. Please fill all steps.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferUpdate();

        try {
            // Create Giveaway in DB
            const giveaway = await giveawayService.createGiveaway({
                title: draft.title,
                description: draft.description || '', // Description might be empty? Validated in Step 1 modal to be required.
                prize: draft.prize,
                end_time: draft.durationMs ? new Date(Date.now() + draft.durationMs) : draft.endTime,
                hosted_by: draft.hostedBy,
                channel_id: draft.channelId,
                guild_id: draft.guildId,
                winners: draft.winners,
                message_id: 'PENDING', // Will be updated after sending
                ping_role_id: draft.pingRoleId
            });

            // Send to channel
            const channel = await client.channels.fetch(draft.channelId) as TextChannel;
            // TODO: Add Button Row (Join, etc)
            // Import from JoinButton or similar logic?
            // Need to define the standard giveaway buttons here.

            // Re-using logic from CreateGiveaway or similar?
            // Wait, we need to create the message with buttons.

            // Let's import ActionRowBuilder, ButtonBuilder, ButtonStyle

            // Fetch Guild Settings for Language
            const settings = await settingsService.getSettings(draft.guildId);
            const lang = settings.language;

            const container = createGiveawayContainer(
                giveaway.title,
                giveaway.description,
                giveaway.prize,
                giveaway.end_time,
                giveaway.hosted_by,
                0, // initial participants
                giveaway.id,
                giveaway.winners,
                lang
            );

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

            const message = await channel.send({
                components: [container, row],
                flags: MessageFlags.IsComponentsV2
            });

            // Update message_id in DB
            giveaway.message_id = message.id;
            await giveawayService.updateGiveaway(giveaway);

            // Cleanup Draft
            giveawayCache.delete(draftId);

            // Update Wizard to say "Published!" and remove components
            // We cannot delete ephemeral messages easily, so we replace them.
            await interaction.editReply({
                content: `✅ **Giveaway Published!**\nCheck <#${draft.channelId}> to see it.`,
                components: []
            });

        } catch (error) {
            console.error('Failed to publish giveaway:', error);
            await interaction.followUp({ content: 'Failed to publish giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
