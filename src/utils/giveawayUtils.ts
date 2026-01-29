import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Client, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { Bot } from '../Bot';
import { webcrypto } from 'node:crypto';

const crypto = webcrypto;

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const rand = new Uint32Array(1);
        crypto.getRandomValues(rand);

        const j = rand[0] % (i + 1);

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

export interface GiveawayResult {
    success: boolean;
    message: string;
    winnerId?: string;
}

export async function endGiveaway(client: Bot, giveawayId: number): Promise<GiveawayResult> {
    try {
        const db = client.database;

        // Fetch giveaway
        const giveawayRows = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
        const giveaway = giveawayRows && giveawayRows[0];

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        if (giveaway.ended) {
            return { success: false, message: 'This giveaway has already ended.' };
        }

        // Fetch entries
        const entries = await db.query('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]) as { user_id: string }[];

        let winnerId: string | null = null;
        if (entries && entries.length > 0) {
            const shuffledEntries = shuffle(entries);
            const winnerEntry = shuffledEntries[0];
            winnerId = winnerEntry.user_id;
        }

        // Mark as ended
        await db.execute('UPDATE giveaways SET ended = 1 WHERE id = ?', [giveawayId]);

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

                    const infoDisplay = new TextDisplayBuilder()
                        .setContent(`🏆 **Prize:** ${giveaway.prize}\n👑 **Winner:** ${winnerId ? `<@${winnerId}>` : 'No winners.'}\n👤 **Hosted By:** <@${giveaway.hosted_by}>`);

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
                    if (winnerId) {
                        await message.reply({
                            content: `🎉 Congratulations <@${winnerId}>! You won **${giveaway.prize}**! 🎉`
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

        if (winnerId) {
            return { success: true, message: 'Giveaway ended successfully!', winnerId: winnerId! };
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
        const db = client.database;

        // Fetch giveaway
        const giveawayRows = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
        const giveaway = giveawayRows && giveawayRows[0];

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        // Fetch entries
        const entries = await db.query('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]) as { user_id: string }[];

        let winnerId: string | null = null;
        if (entries && entries.length > 0) {
            const shuffledEntries = shuffle(entries);
            const winnerEntry = shuffledEntries[0];
            winnerId = winnerEntry.user_id;
        } else {
            return { success: false, message: 'No entries found for this giveaway.' };
        }

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

        return { success: true, message: `Rerolled! New winner: <@${winnerId}>`, winnerId: winnerId! };

    } catch (error) {
        console.error('Error rerolling giveaway:', error);
        return { success: false, message: 'An error occurred while rerolling the giveaway.' };
    }
}
