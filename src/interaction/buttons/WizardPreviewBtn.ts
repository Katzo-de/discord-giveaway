import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { settingsService } from '../../container';

const button: Button = {
    customId: 'wizard_preview',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', flags: MessageFlags.Ephemeral });
            return;
        }

        if (!draft.title || !draft.prize || !draft.endTime || !draft.winners) {
            await interaction.reply({ content: 'Cannot preview incomplete draft.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Fetch Guild Settings for Language
        const settings = await settingsService.getSettings(draft.guildId);
        const lang = settings.language;

        const container = createGiveawayContainer(
            draft.title,
            draft.description || '',
            draft.prize,
            draft.endTime,
            draft.hostedBy,
            0,
            '[PREVIEW]',
            draft.winners,
            lang
        );

        const reply = await interaction.reply({
            components: [container as any],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        });

        // 15 seconds timeout to delete preview
        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (e) {
                // Already deleted or unable to delete
            }
        }, 15000);
    }
};

export default button;
