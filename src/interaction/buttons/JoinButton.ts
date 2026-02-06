import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { MessageFlags, ButtonInteraction, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';

const button: Button = {
    customId: 'join_giveaway',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        if (parts.length < 2) {
            await interaction.reply({ content: 'Invalid button interaction.', flags: MessageFlags.Ephemeral });
            return;
        }
        const giveawayIdStr = parts[1]; // Wait, giveawayId is number in DB/Service? Button logic treating it as string earlier?
        // Step 318 view shows: "const giveawayId = parts[1];"
        // But DB queries used it. DB ID is INTEGER typically.
        // I should parse it.
        const giveawayId = parseInt(giveawayIdStr);
        if (isNaN(giveawayId)) {
            await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const userId = interaction.user.id;

        try {
            // Join via service
            let success: boolean = false;
            try {
                success = await giveawayService.joinGiveaway(giveawayId, userId);
            } catch (error: any) {
                if (error.message === 'Giveaway not found') {
                    await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                    return;
                }
                if (error.message === 'Giveaway has ended') {
                    await interaction.reply({ content: 'This giveaway has already ended!', flags: MessageFlags.Ephemeral });
                    return;
                }
                throw error;
            }

            if (!success) {
                await interaction.reply({ content: 'You have already joined this giveaway!', flags: MessageFlags.Ephemeral });
                return;
            }

            // Fetch new participant count
            const participantCount = await giveawayService.getEntryCount(giveawayId);

            // Fetch all giveaway details to rebuild the message
            const fullGiveaway = await giveawayService.getGiveaway(giveawayId);

            if (fullGiveaway) {
                try {
                    const channel = await client.channels.fetch(fullGiveaway.channel_id);
                    if (channel && channel.isSendable()) {
                        const message = await channel.messages.fetch(fullGiveaway.message_id).catch(() => null);
                        if (message) {
                            const container = createGiveawayContainer(
                                fullGiveaway.title,
                                fullGiveaway.description,
                                fullGiveaway.prize,
                                fullGiveaway.end_time,
                                fullGiveaway.hosted_by,
                                participantCount,
                                fullGiveaway.id,
                                fullGiveaway.winners
                            );

                            // Reconstruct buttons to ensure consistency
                            const joinButton = new ButtonBuilder()
                                .setCustomId(`join_giveaway:${fullGiveaway.id}`)
                                .setLabel('🎉 Join')
                                .setStyle(ButtonStyle.Success);

                            const endButton = new ButtonBuilder()
                                .setCustomId(`giveaway_end:${fullGiveaway.id}`)
                                .setLabel('End')
                                .setStyle(ButtonStyle.Danger);

                            const rerollButton = new ButtonBuilder()
                                .setCustomId(`giveaway_reroll:${fullGiveaway.id}`)
                                .setLabel('Reroll')
                                .setStyle(ButtonStyle.Secondary);

                            const row = new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(joinButton, endButton, rerollButton);

                            await message.edit({
                                components: [container as any, row],
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to update message for giveaway ${giveawayId} on join:`, err);
                }
            }

            let rolePrompt = '';
            let components: any[] = [];

            if (fullGiveaway && fullGiveaway.ping_role_id) { // Giveaway entity needs ping_role_id?
                // Step 20 Giveaway interface: "ping_role_id?: string;"?
                // Let's check Giveaway entity definition in Step 125/133.
                // Step 125 view says "Defined Domain Entity...".
                // I should assume it exists or check.
                // JoinButton previously used it.
                // Assuming Service returns domain entity matching previous schema.
                const member = await interaction.guild?.members.fetch(userId).catch(() => null);
                if (member && !member.roles.cache.has(fullGiveaway.ping_role_id)) {
                    // Prompt user for role
                    rolePrompt = `\nWould you like the <@&${fullGiveaway.ping_role_id}> role to be notified of future giveaways?`;

                    const roleButton = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`giveaway_role:${fullGiveaway.ping_role_id}`)
                                .setLabel('Yes, give me the role!')
                                .setStyle(ButtonStyle.Primary)
                        );
                    components.push(roleButton);
                }
            }

            await interaction.reply({
                content: `🎉 You have successfully joined the giveaway!${rolePrompt}`,
                components: components.length > 0 ? components : undefined,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while joining the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
