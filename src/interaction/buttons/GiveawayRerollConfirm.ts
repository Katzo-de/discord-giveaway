import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { rerollGiveaway } from '../../utils/giveawayUtils';

const button: Button = {
    customId: 'giveaway_reroll_confirm',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1], 10);

        if (!giveawayId) {
             await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
             return;
        }
        
        await interaction.update({ content: 'Rerolling...', components: [] });

        const result = await rerollGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
            
            if (interaction.channel && interaction.channel.isSendable()) {
                 await interaction.channel.send({ content: result.message, allowedMentions: result.winnerId ? { users: [result.winnerId] } : undefined });
            }
        } else {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
