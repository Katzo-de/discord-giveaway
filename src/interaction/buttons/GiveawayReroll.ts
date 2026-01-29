import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const button: Button = {
    customId: 'giveaway_reroll',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parts[1];

        if (!giveawayId) {
             await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
             return;
        }

        try {
            const db = client.database;
            const giveawayRows = await db.query('SELECT hosted_by FROM giveaways WHERE id = ?', [giveawayId]);
            const giveaway = giveawayRows && giveawayRows[0];
            
            if (!giveaway) {
                 await interaction.reply({ content: 'Giveaway not found.', flags: MessageFlags.Ephemeral });
                 return;
            }

            const isHost = giveaway.hosted_by === interaction.user.id;
            const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || 
                            interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);

            if (!isHost && !isAdmin) {
                await interaction.reply({ content: 'You do not have permission to reroll this giveaway.', flags: MessageFlags.Ephemeral });
                return;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId(`giveaway_reroll_confirm:${giveawayId}`)
                .setLabel('Confirm Reroll')
                .setStyle(ButtonStyle.Primary); // Not Danger, just reroll
            
            const cancelButton = new ButtonBuilder()
                .setCustomId(`giveaway_cancel:${giveawayId}`)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            await interaction.reply({ 
                content: 'Are you sure you want to reroll the winner?', 
                components: [row], 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('Error in giveaway_reroll:', error);
            await interaction.reply({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
