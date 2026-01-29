import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';

const command: Command = {
    data: (new SlashCommandBuilder()
        .setName('gend')
        .setDescription('Ends a giveaway immediately')
        .addIntegerOption(option =>
            option.setName('giveaway_id')
                .setDescription('The ID of the giveaway to end')
                .setRequired(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        try {
            const db = client.database;
            
            // Fetch giveaway
            const giveawayRows = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
            const giveaway = giveawayRows && giveawayRows[0];

            if (!giveaway) {
                await interaction.reply({ content: `Giveaway with ID ${giveawayId} not found.`, flags: MessageFlags.Ephemeral });
                return;
            }

            if (giveaway.ended) {
                await interaction.reply({ content: 'This giveaway has already ended.', flags: MessageFlags.Ephemeral });
                return;
            }

            // Message: "Giveaway wird ausgelöst..."
            await interaction.reply({ content: 'Giveaway wird ausgelöst...' });

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
                        const embed = EmbedBuilder.from(message.embeds[0]);
                        embed.setTitle(`[ENDED] ${embed.data.title}`);
                        embed.setColor('#808080'); // Grey
                        
                        if (winnerId) {
                            embed.setDescription(`Winner: <@${winnerId}>\n\n${giveaway.description}`);
                        } else {
                            embed.setDescription(`No winners.\n\n${giveaway.description}`);
                        }

                        // Disable buttons
                        const row = new ActionRowBuilder<ButtonBuilder>();
                        // We could keep the button but disable it, or remove it. Let's disable it if it exists.
                        if (message.components.length > 0) {
                             const component = message.components[0];
                             if (component instanceof ActionRowBuilder) {
                                  // This type check might be tricky with discord.js structures vs builders
                             }
                        }
                        // Simpler: Just create a new disabled button
                        const disabledButton = new ButtonBuilder()
                            .setCustomId('giveaway_ended')
                            .setLabel('Giveaway Ended')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true);
                        
                        row.addComponents(disabledButton);

                        await message.edit({ embeds: [embed], components: [row] });
                    }
                }
            } catch (err) {
                 console.warn(`Could not update message for giveaway ${giveawayId}:`, err);
            }

            // Announce winner
            if (winnerId) {
                await interaction.followUp({ content: `Gewinner ist: <@${winnerId}>! Herzlichen Glückwunsch!`, allowedMentions: { users: [winnerId] } });
            } else {
                await interaction.followUp({ content: 'Gewinner ist: Niemand (Keine Teilnehmer).' });
            }

        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'An error occurred while ending the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
