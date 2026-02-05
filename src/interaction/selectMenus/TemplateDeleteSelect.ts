import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { templateService } from '../../container';

const selectMenu: SelectMenu = {
    customId: 'template_delete_select',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        if (!interaction.guildId) return;

        const name = interaction.values[0];

        try {
            await templateService.deleteTemplate(interaction.guildId, name);
            await interaction.update({ content: `Template "${name}" deleted successfully!`, components: [] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while deleting the template.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default selectMenu;
