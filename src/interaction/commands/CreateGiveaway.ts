import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { wizardGiveawayContainer } from '../../utils/giveawayUtils';
import { giveawayCache } from '../../utils/GiveawayCache';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gcreate')
        .setDescription('Start the giveaway creation wizard') as SlashCommandBuilder,
    execute: async (client: Bot, interaction) => {
        try {
            const locale = interaction.locale;
            const lang = locale.startsWith('de') ? 'de' : 'en'; // Simple mapping

            // Create a new draft
            const draftId = giveawayCache.save({
                hostedBy: interaction.user.id,
                channelId: interaction.channelId!,
                guildId: interaction.guildId!,
                step: 0
            });
            const draft = giveawayCache.get(draftId!);

            const container = wizardGiveawayContainer(lang, draftId, draft);

            await interaction.reply({
                components: [container as any],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });

            // Fetch and store the message ID for cleanup
            const message = await interaction.fetchReply();
            if (draft) {
                draft.wizardMessageId = message.id;
                giveawayCache.save(draft, draftId);
            }
        } catch (error) {
            console.error('Error sending giveaway wizard:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Failed to start giveaway wizard.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'Failed to start giveaway wizard.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};

export default command;
