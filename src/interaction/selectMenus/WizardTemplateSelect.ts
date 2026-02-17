import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';
import { wizardGiveawayContainer } from '../../utils/giveawayUtils';
import { templateService } from '../../container';
import { parseDuration } from '../../utils/timeUtils';

const selectMenu: SelectMenu = {
    customId: 'wizard_template_select', // base
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        const parts = interaction.customId.split(':');
        const draftId = parts[1];
        const choice = interaction.values[0];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', flags: MessageFlags.Ephemeral });
            return;
        }

        if (choice === 'no_templates') {
            await interaction.reply({ content: 'No existing templates found (Mock). Create one via Settings!', flags: MessageFlags.Ephemeral });
            return;
        }

        // Load Template Data
        const template = await templateService.getTemplate(interaction.guildId!, choice);

        if (template) {
            draft.title = template.title;
            draft.description = template.description;
            draft.prize = template.prize;
            // draft.winners = template.winners; // Template doesn't have winners currently

            // Parse Duration from Template if present
            if (template.duration) {
                const durationMs = parseDuration(template.duration);
                if (durationMs) {
                    draft.durationMs = durationMs;
                    // We set endTime based on current time + duration
                    // This is an approximation for the wizard preview, actual start time will be when published (if duration usage is implied)
                    // Or if template has fixed duration, we use that.
                    draft.endTime = new Date(Date.now() + durationMs);
                }
            }

            giveawayCache.save(draft, draftId);
        }

        // Re-render
        const locale = interaction.locale;
        const lang = locale.startsWith('de') ? 'de' : 'en';

        // Fetch templates
        const templates = await templateService.getTemplates(interaction.guildId!);
        const container = wizardGiveawayContainer(lang, draftId, draft, templates);

        await interaction.update({
            components: [container as any],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

export default selectMenu;
