import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { parseDuration, parseDate } from '../../utils/timeUtils';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayService } from '../../container';

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

        if (endTime.getTime() <= Date.now()) {
            await interaction.reply({ content: 'The end time cannot be in the past!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Insert as DRAFT with placeholder message_id
            const placeholderMessageId = 'DRAFT';

            const giveaway = await giveawayService.createGiveaway({
                message_id: placeholderMessageId,
                channel_id: interaction.channelId!,
                guild_id: interaction.guildId!,
                title: title,
                description: description,
                prize: prize,
                end_time: endTime,
                hosted_by: interaction.user.id,
                winners: 1 // Default winners
            });

            if (!giveaway) {
                await interaction.editReply({ content: 'Failed to save giveaway draft.' });
                return;
            }

            const continueButton = new ButtonBuilder()
                .setCustomId(`giveaway_continue:${giveaway.id}`)
                .setLabel('Configure & Publish')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(continueButton);

            await interaction.editReply({
                content: 'Giveaway draft created! Click below to configure winners, roles, and publish it.',
                components: [row]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while creating the giveaway draft.' });
        }
    }
};

export default modal;
