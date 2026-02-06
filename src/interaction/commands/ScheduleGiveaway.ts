import { ActionRowBuilder, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Command } from '../../interface/Command';
import { templateService } from '../../container';
import { Bot } from '../../Bot';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gschedule')
        .setDescription('Schedule a recurring giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) as SlashCommandBuilder,
    execute: async (client: Bot, interaction: ChatInputCommandInteraction) => {
        if (!interaction.guildId) return;

        const templates = await templateService.getTemplates(interaction.guildId);

        if (templates.length === 0) {
            await interaction.reply({ content: 'No templates found. Please create a template first using /gcreate or via dashboard.', ephemeral: true });
            return;
        }

        const options = templates.map(t => ({
            label: t.name,
            description: `Prize: ${t.prize} | Duration: ${t.duration}`,
            value: t.id.toString()
        }));

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('schedule_template_select')
                    .setPlaceholder('Select a template')
                    .addOptions(options)
            );

        await interaction.reply({ content: 'Select a template to schedule:', components: [row], ephemeral: true });
    }
};

export default command;
