import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { templateService } from '../../container';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gcreate')
        .setDescription('Create a new giveaway via setup wizard')
        .addStringOption(option =>
            option.setName('template')
                .setDescription('Name of the template to use (optional)')
                .setRequired(false)
        ) as SlashCommandBuilder,
    execute: async (client: Bot, interaction) => {
        const templateName = interaction.options.getString('template');
        let customId = 'giveaway_duration';

        if (templateName && interaction.guildId) {
            const template = await templateService.getTemplate(interaction.guildId, templateName);
            if (template) {
                customId += `:${template.id}`;
            } else {
                await interaction.reply({ content: `Template "${templateName}" not found.`, flags: MessageFlags.Ephemeral });
                return;
            }
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder('Select a duration for the giveaway')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('1 Hour').setValue('1h'),
                new StringSelectMenuOptionBuilder().setLabel('2 Hours').setValue('2h'),
                new StringSelectMenuOptionBuilder().setLabel('4 Hours').setValue('4h'),
                new StringSelectMenuOptionBuilder().setLabel('8 Hours').setValue('8h'),
                new StringSelectMenuOptionBuilder().setLabel('12 Hours').setValue('12h'),
                new StringSelectMenuOptionBuilder().setLabel('24 Hours').setValue('24h'),
                new StringSelectMenuOptionBuilder().setLabel('2 Days').setValue('2d'),
                new StringSelectMenuOptionBuilder().setLabel('5 Days').setValue('5d'),
                new StringSelectMenuOptionBuilder().setLabel('7 Days').setValue('7d'),

                new StringSelectMenuOptionBuilder().setLabel('Specific Date').setValue('Date'),
                new StringSelectMenuOptionBuilder().setLabel('Custom Duration').setValue('Custom')
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(select);

        await interaction.reply({
            content: templateName ? `Using template: **${templateName}**. Please select a duration:` : 'Please select a duration for the giveaway:',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};

export default command;
