import { PermissionFlagsBits, MessageFlags } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { settingsService } from '../../container';
import { settingsContainer } from '../../utils/giveawayUtils';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gsettings')
        .setDescription('Configure giveaway bot settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,
    execute: async (client: Bot, interaction) => {
        if (!interaction.isChatInputCommand()) return;

        if (!interaction.guildId) {
            await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Get current settings
        const settings = await settingsService.getSettings(interaction.guildId);
        const lang = settings?.language || 'en';

        const container = settingsContainer(settings, lang);

        // Cast container to any because TypeScript might not fully recognize it as a valid APIActionRowComponent yet in this environment
        await interaction.reply({
            components: [container as any],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
    }
};

export default command;
