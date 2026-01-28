import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction } from 'discord.js';
import { parseDuration } from '../../utils/timeUtils';

const modal: Modal = {
    customId: 'giveaway_create',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');
        const prize = interaction.fields.getTextInputValue('prize');
        
        // Parse customId "giveaway_create:<duration>"
        const parts = interaction.customId.split(':');
        let durationString = parts.length > 1 ? parts[1] : null;

        if (durationString === 'Custom') {
            durationString = interaction.fields.getTextInputValue('custom_duration');
        }

        if (!durationString) {
             await interaction.reply({ content: 'Could not determine duration.', flags: MessageFlags.Ephemeral });
             return;
        }

        const durationMs = parseDuration(durationString);

        if (!durationMs) {
            await interaction.reply({ content: 'Invalid duration format! Please use format like 1h, 30m, 2d.', flags: MessageFlags.Ephemeral });
            return;
        }

        const endTime = new Date(Date.now() + durationMs);

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields(
                    { name: 'Prize', value: prize, inline: true },
                    { name: 'Ends In', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true },
                    { name: 'Hosted By', value: interaction.user.toString(), inline: true }
                )
                .setColor('#FF0000')
                .setFooter({ text: 'Ends at' })
                .setTimestamp(endTime);

            if (!interaction.channel || !interaction.channel.isSendable()) {
                 await interaction.editReply({ content: 'Cannot send messages in this channel.' });
                 return;
            }

            const sentMessage = await interaction.channel.send({ embeds: [embed] });
            
            if (!sentMessage) {
                await interaction.editReply({ content: 'Failed to send giveaway message.' });
                return;
            }

            const db = client.database;
            
            // Use 'execute' for INSERT
            await db.execute(
                `INSERT INTO giveaways (message_id, channel_id, guild_id, title, description, prize, end_time, hosted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sentMessage.id, interaction.channelId, interaction.guildId, title, description, prize, endTime.toISOString(), interaction.user.id]
            );

            // Use 'query' to fetch ID
            const rows = await db.query(`SELECT id FROM giveaways WHERE message_id = ?`, [sentMessage.id]);
            const giveaway = rows && rows[0]; // Better-sqlite3 typically returns array
            
            if (!giveaway) {
                 await interaction.editReply({ content: 'Failed to save giveaway to database.' });
                 return;
            }
            
            const joinButton = new ButtonBuilder()
                .setCustomId(`join_giveaway:${giveaway.id}`)
                .setLabel('🎉 Join Giveaway')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(joinButton);

            await sentMessage.edit({ components: [row] });

            await interaction.editReply({ content: 'Giveaway created successfully!' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while creating the giveaway.' });
        }
    }
};

export default modal;
