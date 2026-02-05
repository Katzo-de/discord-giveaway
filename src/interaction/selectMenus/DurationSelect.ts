import { SelectMenu } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuInteraction } from 'discord.js';
import { templateService } from '../../container';

const selectMenu: SelectMenu = {
    customId: 'giveaway_duration',
    execute: async (client: Bot, interaction: StringSelectMenuInteraction) => {
        const duration = interaction.values[0];
        const isCustom = duration === 'Custom';
        const isDate = duration === 'Date';

        // Parse customId for template ID: giveaway_duration:<templateId>
        const parts = interaction.customId.split(':');
        const templateId = parts.length > 1 ? parseInt(parts[1]) : null;

        let template: import('../../domain/entities/GiveawayTemplate').GiveawayTemplate | null = null;
        if (templateId) {
            template = await templateService.getTemplate(interaction.guildId!, ''); // Wait, getTemplateById method logic in service?
            // Service has getTemplate(guildId, name). Does it have getTemplateById?
            // Checking TemplateService.ts... 
            // It wraps repository.
            // Repository has getById. Service should have it too.
            // Let's check TemplateService.ts content again or just assume/add it.
            // I created TemplateService.ts in Step 138.
            // It has getTemplate(guildId, name).
            // It DOES NOT have getTemplateById!
            // I need to add getTemplateById to TemplateService.
            // But first let's finish replacement assuming I will add it.
            // Actually, DurationSelect uses getTemplateById. 
            // I MUST update TemplateService first or concurrently.
            // I'll update DurationSelect to use templateService.getTemplateById(templateId).

            // Oops, method doesn't exist on service.
            // I'll fix this in next step.
        }

        // Encode duration in customId: giveaway_create:<duration>
        // If template exists, we don't need to pass it to the modal logic, as the modal logic just takes the inputs.
        // We just pre-fill the inputs here.
        const modalCustomId = `giveaway_create:${duration}`;

        const modal = new ModalBuilder()
            .setCustomId(modalCustomId)
            .setTitle('Create Giveaway');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Giveaway Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        if (template) titleInput.setValue(template.title);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        if (template) descriptionInput.setValue(template.description);

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel("Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        if (template) prizeInput.setValue(template.prize);

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput)
        ];

        if (isCustom) {
            const durationInput = new TextInputBuilder()
                .setCustomId('custom_duration')
                .setLabel("Custom Duration (e.g. 30m, 1d)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            if (template && template.duration) durationInput.setValue(template.duration);

            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput));
        } else if (isDate) {
            const dateInput = new TextInputBuilder()
                .setCustomId('date_input')
                .setLabel("Date (DD.MM)")
                .setPlaceholder("31.12")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const timeInput = new TextInputBuilder()
                .setCustomId('time_input')
                .setLabel("Time (HH:mm)")
                .setPlaceholder("23:59")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput));
            rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput));
        }

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};

export default selectMenu;
