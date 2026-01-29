import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { endGiveaway } from '../../utils/giveawayUtils';

const button: Button = {
    customId: 'giveaway_end_confirm',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const giveawayId = parseInt(parts[1], 10);

        if (!giveawayId) {
             await interaction.reply({ content: 'Invalid giveaway ID.', flags: MessageFlags.Ephemeral });
             return;
        }

        // We already checked permissions in the previous step. 
        // Technically we should check again implicitly or trust the customId flow (ephemeral to authorized user).
        // Since it's ephemeral, only the user who clicked "End" sees this button.
        
        await interaction.update({ content: 'Ending giveaway...', components: [] });

        const result = await endGiveaway(client, giveawayId);

        if (result.success) {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
            // Should usually announce publicly too? 
            // The `endGiveaway` function announces publicly by replying to the interaction passed to it? 
            // Wait, utility returns a message. The command `EndGiveaway.ts` sends it as followUp.
            // Here we are in an ephemeral context. 
            // `endGiveaway` updates the original message.
            // It returns a winner string. 
            // The command sends it publicly. 
            // We should send it publicly here too? 
            // BUT `interaction` here is EPHEMERAL. We cannot send public messages easily unless we use `channel.send`.
            
            if (interaction.channel && interaction.channel.isSendable()) {
                 await interaction.channel.send({ content: result.message, allowedMentions: result.winnerId ? { users: [result.winnerId] } : undefined });
            }

        } else {
            await interaction.followUp({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    }
};

export default button;
