import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, MessageFlags, StringSelectMenuOptionBuilder, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';
import { getTranslation } from '../../utils/languageUtils';
import { settingsService } from '../../container';

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

        const container = new ContainerBuilder();

        const titleDisplay = new TextDisplayBuilder()
            .setContent(`# ${getTranslation('settings.title', lang)}`); // Optional styling if supported, otherwise just content

        const languageDisplay = new TextDisplayBuilder()
            .setContent(`### ${getTranslation('settings.language.name', lang)}\n${getTranslation('settings.language.description', lang)}`);

        const roleDisplay = new TextDisplayBuilder()
            .setContent(`### ${getTranslation('settings.role.name', lang)}\n${getTranslation('settings.role.description', lang)}`);

        // Based on usage in giveawayUtils, we add text displays to the container
        container.addTextDisplayComponents(titleDisplay, languageDisplay, roleDisplay);

        const languageSelect = new StringSelectMenuBuilder()
            .setCustomId('settings_language')
            .setPlaceholder(getTranslation('settings.language.name', lang))
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('English')
                    .setValue('en')
                    .setDefault(lang === 'en'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Deutsch')
                    .setValue('de')
                    .setDefault(lang === 'de')
            );

        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId('settings_role')
            .setPlaceholder(getTranslation('settings.role.name', lang));

        if (settings?.manager_role_id) {
            roleSelect.addDefaultRoles([settings.manager_role_id]);
        }

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(languageSelect);
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

        const templateButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('template_create_btn')
                .setLabel('Create Template')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('template_delete_btn')
                .setLabel('Delete Template')
                .setStyle(ButtonStyle.Danger)
        );

        // Cast container to any because TypeScript might not fully recognize it as a valid APIActionRowComponent yet in this environment
        await interaction.reply({
            components: [container as any, row1, row2, templateButtons],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        });
    }
};

export default command;
