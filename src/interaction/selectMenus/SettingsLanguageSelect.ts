import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { getTranslation } from '../../utils/languageUtils';

const selectMenu: SelectMenu = {
    customId: 'settings_language',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        const language = interaction.values[0];
        const guildId = interaction.guildId!;

        await client.database.setGuildSettings(guildId, { language });

        const lang = language; // New language
        await interaction.reply({
            content: getTranslation('settings.language.updated', lang),
            flags: MessageFlags.Ephemeral
        });
    }
};

export default selectMenu;
