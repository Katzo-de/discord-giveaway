import { Button } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';
import { templateService } from '../../container';

const templateDeleteBtn: Button = {
    customId: 'template_delete_btn',
    execute: async (client: Bot, interaction: ButtonInteraction) => {
        if (!interaction.guildId) return;

        const templates = await templateService.getTemplates(interaction.guildId);

        if (templates.length === 0) {
            await interaction.reply({ content: 'No templates found to delete.', flags: MessageFlags.Ephemeral });
            return;
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('template_delete_select')
            .setPlaceholder('Select a template to delete');

        // Max options is 25
        const options = templates.slice(0, 25).map(t =>
            new StringSelectMenuOptionBuilder()
                .setLabel(t.name)
                .setDescription(t.title.substring(0, 50))
                .setValue(t.name)
        );

        select.addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        await interaction.reply({
            content: 'Select a template to delete:',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};

export default templateDeleteBtn;
