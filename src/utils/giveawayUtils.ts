import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Client, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { Bot } from '../Bot';

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
        const entries = await db.query('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);

        let winnerId: string | null = null;
        if (entries && entries.length > 0) {
           const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
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
                        .setContent(`**[ENDED] ${giveaway.title}**`);
                    
                    const descDisplay = new TextDisplayBuilder()
                        .setContent(giveaway.description);

                    const resultDisplay = new TextDisplayBuilder()
                        .setContent(winnerId ? `**Winner:** <@${winnerId}>` : '**Winner:** No winners.');

                    const footerDisplay = new TextDisplayBuilder()
                        .setContent(`Ended • ID: ${giveaway.id}`);

                    container.addTextDisplayComponents(titleDisplay, descDisplay, resultDisplay, footerDisplay);

                    // Disable buttons
                    const row = new ActionRowBuilder<ButtonBuilder>();
                    
                    const disabledButton = new ButtonBuilder()
                        .setCustomId('giveaway_ended')
                        .setLabel('Giveaway Ended')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);
                    
                    row.addComponents(disabledButton);

                    await message.edit({ components: [container as any, row] });
                }
            }
        } catch (err) {
             console.warn(`Could not update message for giveaway ${giveawayId}:`, err);
             // Verify if we should return failure here? detailed requirements say "announce winner", 
             // updating message is part of it but if message deleted, we still might want to announce?
             // Proceeding is safer.
        }

        if (winnerId) {
            return { success: true, message: `Gewinner ist: <@${winnerId}>! Herzlichen Glückwunsch!`, winnerId: winnerId };
        } else {
            return { success: true, message: 'Gewinner ist: Niemand (Keine Teilnehmer).' };
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
        // We might want to check checks if it IS ended? Usually reroll is only for ended giveaways.
        // The original code didn't check for 'ended', but usually reroll is post-end. 
        // Let's assume it can be done anytime or we should check?
        // Standard behavior: Reroll is for picking a NEW winner for an ENDED giveaway. 
        // But if the user runs it on active one? 
        // The original command didn't check `ended` status. I'll stick to original logic but maybe logic should imply it's valid.

        const giveawayRows = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
        const giveaway = giveawayRows && giveawayRows[0];

        if (!giveaway) {
             return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        // Fetch entries
        const entries = await db.query('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);

        if (!entries || entries.length === 0) {
            return { success: false, message: 'No entries found for this giveaway.' };
        }

        // Pick random winner
        const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
        const winnerId = winnerEntry.user_id;

        return { success: true, message: `🎉 The new winner is <@${winnerId}>! Congratulations!`, winnerId: winnerId };

    } catch (error) {
        console.error('Error rerolling giveaway:', error);
        return { success: false, message: 'An error occurred while rerolling the giveaway.' };
    }
}
