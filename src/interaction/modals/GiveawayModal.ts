import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { parseDuration, parseDate } from '../../utils/timeUtils';
import { createGiveawayContainer } from '../../utils/giveawayUtils';

const modal: Modal = {
    customId: 'giveaway_create',
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');
        const prize = interaction.fields.getTextInputValue('prize');

        // Parse customId "giveaway_create:<duration>"
        const parts = interaction.customId.split(':');
        let durationString = parts.length > 1 ? parts[1] : null;

        let endTime: Date | null = null;
        let durationMs: number | null = null;

        if (durationString === 'Custom') {
            const customInput = interaction.fields.getTextInputValue('custom_duration');
            durationMs = parseDuration(customInput);
            if (durationMs) {
                endTime = new Date(Date.now() + durationMs);
            }
        } else if (durationString === 'Date') {
            const dateInput = interaction.fields.getTextInputValue('date_input');
            const timeInput = interaction.fields.getTextInputValue('time_input');
            endTime = parseDate(dateInput, timeInput);
        } else if (durationString) {
            durationMs = parseDuration(durationString);
            if (durationMs) {
                endTime = new Date(Date.now() + durationMs);
            }
        }

        if (!endTime) {
            await interaction.reply({ content: 'Invalid duration or date format! For Custom duration use format like 1h, 30m. For Date use DD.MM with Time HH:mm.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Check if date is in the past (extra safety, though parseDate infers next year usually only if exact match or simple comparison)
        // parseDate already handles "if in past, move to next year" logic for the specific day/month.
        // But if user gives a time shortly in the past for TODAY, parseDate might have returned today's date but earlier time?
        // Let's check:
        // parseDate logic: "If the constructed date is in the past, assume it's meant for next year"
        // So it should be safe. But let's verify if 'now' check is strictly > now.
        if (endTime.getTime() <= Date.now()) {
            // In rare edge case where parseDate didn't catch it or logic is slightly off
            await interaction.reply({ content: 'The end time cannot be in the past!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // New Container Structure
            // New Container Structure
            const container = createGiveawayContainer(title, description, prize, endTime, interaction.user.id, 0);

            if (!interaction.channel || !interaction.channel.isSendable()) {
                await interaction.editReply({ content: 'Cannot send messages in this channel.' });
                return;
            }

            const sentMessage = await interaction.channel.send({
                components: [container as any],
                flags: MessageFlags.IsComponentsV2
            });

            if (!sentMessage) {
                await interaction.editReply({ content: 'Failed to send giveaway message.' });
                return;
            }

            const db = client.database;

            // Use 'execute' for INSERT
            await db.execute(
                `INSERT INTO giveaways (message_id, channel_id, guild_id, title, description, prize, end_time, hosted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sentMessage.id, interaction.channelId, interaction.guildId, title, description, prize, endTime, interaction.user.id]
            );

            // Use 'query' to fetch ID
            const rows = await db.query(`SELECT id FROM giveaways WHERE message_id = ?`, [sentMessage.id]);
            const giveaway = rows && rows[0];

            if (!giveaway) {
                await interaction.editReply({ content: 'Failed to save giveaway to database.' });
                return;
            }

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

            // Update footer with ID
            // footerDisplay.setContent(`Ends at • ID: ${giveaway.id}`); // Old way

            // Rebuild container components? Or just modify object? Builders are mutable usually? 
            // Ideally clear and add again or just creating new container
            const pagedContainer = createGiveawayContainer(title, description, prize, endTime, interaction.user.id, 0, giveaway.id);

            await sentMessage.edit({
                components: [pagedContainer as any, row],
                flags: MessageFlags.IsComponentsV2 // Keep the flag on edits just in case, though usually purely content update is checking message state? 
                // Wait, flags are usually on creation, but maybe fine on edit too to Assert V2.
            });

            await interaction.editReply({ content: 'Giveaway created successfully!' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while creating the giveaway.' });
        }
    }
};

export default modal;
