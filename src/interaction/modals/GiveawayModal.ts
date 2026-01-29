import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
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
            // New Container Structure
            const container = new ContainerBuilder();
            
            const titleDisplay = new TextDisplayBuilder()
                .setContent(`**${title}**`);
            
            const descDisplay = new TextDisplayBuilder()
                .setContent(description);

            const prizeDisplay = new TextDisplayBuilder()
                .setContent(`**Prize:** ${prize}`);

            const endsInDisplay = new TextDisplayBuilder()
                .setContent(`**Ends In:** <t:${Math.floor(endTime.getTime() / 1000)}:R>`);

            const hostedByDisplay = new TextDisplayBuilder()
                .setContent(`**Hosted By:** ${interaction.user.toString()}`);
            
            const footerDisplay = new TextDisplayBuilder()
                .setContent(`Ends at • ID: (Pending)`); // will update

            container.addTextDisplayComponents(titleDisplay, descDisplay, prizeDisplay, endsInDisplay, hostedByDisplay, footerDisplay);

            if (!interaction.channel || !interaction.channel.isSendable()) {
                 await interaction.editReply({ content: 'Cannot send messages in this channel.' });
                 return;
            }

            // Note: We need to cast container to any because types might be strict about ActionRow only
            const sentMessage = await interaction.channel.send({ components: [container as any] });
            
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
            const giveaway = rows && rows[0]; 
            
            if (!giveaway) {
                 await interaction.editReply({ content: 'Failed to save giveaway to database.' });
                 return;
            }
            
            const joinButton = new ButtonBuilder()
                .setCustomId(`join_giveaway:${giveaway.id}`)
                .setLabel('🎉 Join Giveaway')
                .setStyle(ButtonStyle.Primary);

            const endButton = new ButtonBuilder()
                .setCustomId(`giveaway_end:${giveaway.id}`)
                .setLabel('End Giveaway')
                .setStyle(ButtonStyle.Danger);

            const rerollButton = new ButtonBuilder()
                .setCustomId(`giveaway_reroll:${giveaway.id}`)
                .setLabel('Reroll Prize')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(joinButton, endButton, rerollButton);

            // Update footer with ID
            footerDisplay.setContent(`Ends at • ID: ${giveaway.id}`);
             
            // Rebuild container components? Or just modify object? Builders are mutable usually? 
            // Ideally clear and add again or just creating new container
            const pagedContainer = new ContainerBuilder()
                .addTextDisplayComponents(titleDisplay, descDisplay, prizeDisplay, endsInDisplay, hostedByDisplay, footerDisplay);

            await sentMessage.edit({ components: [pagedContainer as any, row] });

            await interaction.editReply({ content: 'Giveaway created successfully!' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while creating the giveaway.' });
        }
    }
};

export default modal;
