import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { giveawayService } from '../../container';

const command: Command = {
    data: (new SlashCommandBuilder()
        .setName('gdelete')
        .setDescription('Deletes a giveaway')
        .addIntegerOption(option =>
            option.setName('giveaway_id')
                .setDescription('The ID of the giveaway to delete')
                .setRequired(true)
        ) as SlashCommandBuilder)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (client: Bot, interaction) => {
        const giveawayId = interaction.options.getInteger('giveaway_id', true);

        try {
            // Check if giveaway exists
            const giveaway = await giveawayService.getGiveaway(giveawayId);

            if (!giveaway) {
                await interaction.reply({ content: `Giveaway with ID ${giveawayId} not found.`, flags: MessageFlags.Ephemeral });
                return;
            }

            // Delete message if possible
            try {
                const channel = await client.channels.fetch(giveaway.channel_id);
                if (channel && channel.isSendable()) {
                    const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                    if (message) {
                        await message.delete();
                    }
                }
            } catch (err) {
                console.warn(`Could not delete message for giveaway ${giveawayId}:`, err);
            }

            // Delete from database
            await giveawayService.deleteGiveaway(giveawayId);

            await interaction.reply({ content: `Giveaway ${giveawayId} has been deleted.`, flags: MessageFlags.Ephemeral });

            await interaction.reply({ content: `Giveaway ${giveawayId} has been deleted.`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while deleting the giveaway.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
