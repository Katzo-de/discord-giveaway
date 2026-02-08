import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';
import { wizardGiveawayContainer } from '../../utils/giveawayUtils';
// import { templateService } from '../../container'; // Assumed service exists

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

        // TODO: Load Template Data
        // const template = await templateService.getTemplate(interaction.guildId!, choice);
        // if (template) {
        //     draft.title = template.title;
        //     draft.description = template.description;
        //     draft.prize = template.prize;
        //     draft.winners = template.winners; // if exists
        //     // Duration handling...
        //     giveawayCache.save(draft, draftId);
        // }

        // Re-render
        const locale = interaction.locale;
        const lang = locale.startsWith('de') ? 'de' : 'en';
        const container = wizardGiveawayContainer(lang, draftId, draft);

        await interaction.update({
            components: [container as any],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

export default selectMenu;
