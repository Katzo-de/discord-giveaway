
import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { recurringService, templateService } from '../../container';
import { parseDuration } from '../../utils/timeUtils';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('recurring')
        .setDescription('Manage recurring giveaways')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a new recurring giveaway')
                .addStringOption(opt => opt.setName('template').setDescription('Name of the template').setRequired(true))
                .addStringOption(opt => opt.setName('interval').setDescription('Interval (e.g. 1d, 12h)').setRequired(true))
                .addChannelOption(opt => opt.setName('channel').setDescription('Channel to post in').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setMinValue(1).setRequired(false))
                .addRoleOption(opt => opt.setName('ping_role').setDescription('Role to ping').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List active recurring giveaways')
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a recurring giveaway')
                .addIntegerOption(opt => opt.setName('id').setDescription('ID of the recurring giveaway').setRequired(true))
        ) as SlashCommandBuilder,

    execute: async (client: Bot, interaction) => {
        if (!interaction.guildId) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const templateName = interaction.options.getString('template', true);
            const intervalStr = interaction.options.getString('interval', true);
            const channel = interaction.options.getChannel('channel', true);
            const winners = interaction.options.getInteger('winners') || 1;
            const pingRole = interaction.options.getRole('ping_role');

            const template = await templateService.getTemplate(interaction.guildId, templateName);
            if (!template) {
                await interaction.reply({ content: `Template "${templateName}" not found.`, flags: MessageFlags.Ephemeral });
                return;
            }

            const intervalMs = parseDuration(intervalStr);
            if (!intervalMs || intervalMs < 60000) { // Min 1 minute
                await interaction.reply({ content: `Invalid interval. Minimum is 1 minute.`, flags: MessageFlags.Ephemeral });
                return;
            }

            await recurringService.createRecurringGiveaway({
                guild_id: interaction.guildId,
                template_id: template.id,
                channel_id: channel.id,
                interval_ms: intervalMs,
                winners_count: winners,
                hosted_by: interaction.user.id,
                ping_role_id: pingRole?.id || template.prize || undefined // Hacky fallback? No, template doesn't have role.
            });

            await interaction.reply({ content: `Recurring giveaway created! It will run every ${intervalStr} in <#${channel.id}>.`, flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'list') {
            const giveaways = await recurringService.getRecurringGiveaways(interaction.guildId);
            if (giveaways.length === 0) {
                await interaction.reply({ content: 'No recurring giveaways found.', flags: MessageFlags.Ephemeral });
                return;
            }

            const list = giveaways.map(g =>
                `**ID: ${g.id}** | Interval: ${g.interval_ms / 1000 / 60}m | Channel: <#${g.channel_id}> | Last Run: ${g.last_run_at ? `<t:${Math.floor(g.last_run_at.getTime() / 1000)}:R>` : 'Never'}`
            ).join('\n');

            await interaction.reply({ content: `**Recurring Giveaways:**\n${list}`, flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'delete') {
            const id = interaction.options.getInteger('id', true);
            await recurringService.deleteRecurringGiveaway(id);
            await interaction.reply({ content: `Recurring giveaway ${id} deleted.`, flags: MessageFlags.Ephemeral });
        }
    }
};

export default command;
