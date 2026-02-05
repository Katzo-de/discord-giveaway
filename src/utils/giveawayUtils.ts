import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Client, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { Bot } from '../Bot';
import { giveawayService } from '../container';

export interface GiveawayResult {
    success: boolean;
    message: string;
    winnerIds?: string[];
}

export async function endGiveaway(client: Bot, giveawayId: number): Promise<GiveawayResult> {
    try {
        // Fetch giveaway to check status and get message details
        // We use service to end it, which handles DB update and winner selection
        let winners: string[] = [];
        let giveaway = await giveawayService.getGiveaway(giveawayId);

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        if (giveaway.ended) {
            return { success: false, message: 'This giveaway has already ended.' };
        }

        // End the giveaway via service
        // Service.endGiveaway returns winners
        winners = await giveawayService.endGiveaway(giveawayId);

        // Re-fetch giveaway to ensure we have latest state (though endGiveaway updates passed object in memory? 
        // Service code: "giveaway.ended = true; await update(giveaway);" 
        // But our local 'giveaway' var here is a different copy if getGiveaway fetched a new object. 
        // Service fetches it internally.
        // So we update our local object state or re-fetch.
        giveaway.ended = true;

        if (giveaway.message_id === 'DRAFT') {
            return { success: true, message: 'Draft giveaway ended (cleaned up).' };
        }

        // Get entries count for message
        const entryCount = await giveawayService.getEntryCount(giveawayId);
        // Note: winners are returned by service endGiveaway which picked them from DB state before update? Yes.

        // Update original message
        try {
            const channel = await client.channels.fetch(giveaway.channel_id);
            if (channel && channel.isSendable()) {
                const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                if (message) {
                    // Rebuild Container for Ended State
                    const container = new ContainerBuilder();

                    const titleDisplay = new TextDisplayBuilder()
                        .setContent(`# 🛑 [ENDED] ${giveaway.title} 🛑`);

                    const descDisplay = new TextDisplayBuilder()
                        .setContent(giveaway.description);

                    const winnersText = winners.length > 0
                        ? winners.map(id => `<@${id}>`).join(', ')
                        : 'No winners.';

                    const infoDisplay = new TextDisplayBuilder()
                        .setContent(`🏆 **Prize:** ${giveaway.prize}\n👑 **Winners:** ${winnersText}\n👤 **Hosted By:** <@${giveaway.hosted_by}>\n👥 **Participants:** ${entryCount}`);

                    const footerDisplay = new TextDisplayBuilder()
                        .setContent(`Ended • ID: ${giveaway.id}`);

                    container.addTextDisplayComponents(titleDisplay, descDisplay, infoDisplay, footerDisplay);

                    // Disable buttons
                    const row = new ActionRowBuilder<ButtonBuilder>();

                    const disabledButton = new ButtonBuilder()
                        .setCustomId('giveaway_ended')
                        .setLabel('Ended')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    row.addComponents(disabledButton);

                    await message.edit({
                        components: [container as any, row],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // Announce winner as a reply to the giveaway message
                    if (winners.length > 0) {
                        const winnersString = winners.map(id => `<@${id}>`).join(', ');
                        await message.reply({
                            content: `🎉 Congratulations ${winnersString}! You won **${giveaway.prize}**! 🎉`
                        });
                    } else {
                        await message.reply({
                            content: 'No valid entries, so no winner could be chosen.'
                        });
                    }
                }
            }
        } catch (err) {
            console.warn(`Could not update message for giveaway ${giveawayId}:`, err);
        }

        if (winners.length > 0) {
            return { success: true, message: 'Giveaway ended successfully!', winnerIds: winners };
        } else {
            return { success: true, message: 'Giveaway ended (no participants).' };
        }

    } catch (error) {
        console.error('Error ending giveaway:', error);
        return { success: false, message: 'An error occurred while ending the giveaway.' };
    }
}

export async function rerollGiveaway(client: Bot, giveawayId: number): Promise<GiveawayResult> {
    try {
        const giveaway = await giveawayService.getGiveaway(giveawayId);

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        // Reroll via service
        // Service.rerollGiveaway checks if ended, throws if not
        let winners: string[] = [];
        try {
            winners = await giveawayService.rerollGiveaway(giveawayId);
        } catch (e: any) {
            return { success: false, message: e.message };
        }

        if (winners.length === 0) {
            return { success: false, message: 'No entries found for this giveaway.' };
        }

        const winnerId = winners[0];

        // Fetch and reply to the original message
        try {
            const channel = await client.channels.fetch(giveaway.channel_id);
            if (channel && channel.isSendable()) {
                const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                if (message) {
                    await message.reply({
                        content: `🎉 **Reroll:** The new winner is <@${winnerId}>! Congratulations!`
                    });
                }
            }
        } catch (err) {
            console.warn(`Could not fetch message for giveaway ${giveawayId} during reroll:`, err);
        }

        return { success: true, message: `Rerolled! New winner: <@${winnerId}>`, winnerIds: [winnerId] };

    } catch (error) {
        console.error('Error rerolling giveaway:', error);
        return { success: false, message: 'An error occurred while rerolling the giveaway.' };
    }
}

export function createGiveawayContainer(
    title: string,
    description: string,
    prize: string,
    endTime: Date,
    hostedByUserId: string,
    participantCount: number,
    giveawayId?: number | string,
    winnerCount: number = 1
): ContainerBuilder {
    const container = new ContainerBuilder();

    const titleDisplay = new TextDisplayBuilder()
        .setContent(`# 🎉 ${title} 🎉`);

    const descDisplay = new TextDisplayBuilder()
        .setContent(description);

    const infoDisplay = new TextDisplayBuilder()
        .setContent(`🏆 **Prize:** ${prize}\n⏰ **Ends:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n👤 **Hosted By:** <@${hostedByUserId}>\n👥 **Participants:** ${participantCount}\n🎫 **Winners:** ${winnerCount}`);

    const footerText = giveawayId ? `Ends at • ID: ${giveawayId}` : `Ends at • ID: (Pending)`;
    const footerDisplay = new TextDisplayBuilder()
        .setContent(footerText);

    container.addTextDisplayComponents(titleDisplay, descDisplay, infoDisplay, footerDisplay);

    return container;
}
