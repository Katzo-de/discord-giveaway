import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { settingsService } from '../../container';
import { settingsContainer } from '../../utils/giveawayUtils';
import { getTranslation } from '../../utils/languageUtils';

const menu: SelectMenu = {
    customId: 'settings_timezone',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        // Defer update to allow time for processing
        await interaction.deferUpdate();

        const guildId = interaction.guildId!;
        const selectedTimezone = interaction.values[0];

        // Update settings
        await settingsService.updateSettings(guildId, {
            timezone: selectedTimezone
        });

        // Fetch updated settings to rebuild UI
        const settings = await settingsService.getSettings(guildId);
        const lang = settings.language;

        // Rebuild container
        const container = settingsContainer(settings, lang);

        await interaction.editReply({
            components: [container as any],
            flags: MessageFlags.IsComponentsV2
        });

        // Optional: Send ephemeral confirmation (might be redundant if UI updates, but good for feedback)
        // Since we deferred update, we can't reply ephemeral easily without followUp, but editReply updates the message.
        // We could send a followUp but it might spam. The UI update showing the new "Current Timezone" is sufficient.
    }
};

export default menu;
