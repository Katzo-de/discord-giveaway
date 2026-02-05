import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { RoleSelectMenuInteraction, MessageFlags } from 'discord.js';
import { getTranslation } from '../../utils/languageUtils';
import { settingsService } from '../../container';

const selectMenu: SelectMenu = {
    customId: 'settings_role',
    execute: async (client: Bot, interaction: RoleSelectMenuInteraction) => {
        const roleId = interaction.values[0];
        const guildId = interaction.guildId!;

        await settingsService.updateSettings(guildId, { manager_role_id: roleId });

        const settings = await settingsService.getSettings(guildId);
        const lang = settings?.language || 'en';

        await interaction.reply({
            content: getTranslation('settings.role.updated', lang, { role: `<@&${roleId}>` }),
            flags: MessageFlags.Ephemeral
        });
    }
};

export default selectMenu;
