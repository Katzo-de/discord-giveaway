
import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags } from 'discord.js';

const button: Button = {
    customId: 'giveaway_role',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        if (parts.length < 2) {
            await interaction.reply({ content: 'Invalid button interaction.', flags: MessageFlags.Ephemeral });
            return;
        }
        const roleId = parts[1];

        try {
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (!member) {
                await interaction.reply({ content: 'Could not fetch your member profile.', flags: MessageFlags.Ephemeral });
                return;
            }

            const role = await interaction.guild?.roles.fetch(roleId);
            if (!role) {
                await interaction.reply({ content: 'Role not found.', flags: MessageFlags.Ephemeral });
                return;
            }

            await member.roles.add(role);
            await interaction.reply({ content: `✅ successfully assigned **${role.name}**.`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error('Error assigning role:', error);
            await interaction.reply({ content: 'Failed to assign role. I might not have permission given that I am a bot.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
