import { Modal } from '../../interface/Component';
import { Bot } from '../../Bot';
import { ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { giveawayCache } from '../../utils/GiveawayCache';
import { wizardGiveawayContainer } from '../../utils/giveawayUtils';
import { settingsService, templateService } from '../../container';
import { parseDuration, parseDate } from '../../utils/timeUtils';

const modal: Modal = {
    customId: 'wizard_step', // Base ID, we'll check prefix
    execute: async (client: Bot, interaction: ModalSubmitInteraction) => {
        const parts = interaction.customId.split(':');
        // Structure: wizard_step:<action>:<draftId>
        const action = parts[1];
        const draftId = parts[2];

        if (!draftId) {
            await interaction.reply({ content: 'Invalid draft ID.', flags: MessageFlags.Ephemeral });
            return;
        }

        const draft = giveawayCache.get(draftId);
        if (!draft) {
            await interaction.reply({ content: 'Draft not found or expired.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Handle different steps
        if (action === 'step1') {
            const title = interaction.fields.getTextInputValue('title');
            const prize = interaction.fields.getTextInputValue('prize');
            const description = interaction.fields.getTextInputValue('description');

            draft.title = title;
            draft.prize = prize;
            draft.description = description;

        } else if (action === 'step2') {
            const durationInput = interaction.fields.getTextInputValue('duration');
            // Check for winners input (might be optional in future but required for now as per user request to move it here)
            // But we made it required=false in button code? Let's check logic.
            // "winners" input ID.
            let winnersInput: string | null = null;
            try {
                winnersInput = interaction.fields.getTextInputValue('winners');
            } catch (e) {
                // Ignore if not present (backward compatibility or if we decide to split)
            }

            // --- Duration Logic ---
            let durationMs = parseDuration(durationInput);
            let endTime: Date | null = null;

            if (durationMs) {
                endTime = new Date(Date.now() + durationMs);
                draft.durationMs = durationMs;
            } else {
                const dateParts = durationInput.split(' ');
                if (dateParts.length === 2) {
                    // Fetch Guild Settings for Timezone
                    const settings = await settingsService.getSettings(interaction.guildId!);
                    const timezone = settings.timezone || 'UTC';

                    endTime = parseDate(dateParts[0], dateParts[1], timezone);
                }
                // If it's a fixed date, we don't store durationMs, so it relies on endTime (fixed point)
                delete draft.durationMs;
            }

            if (!endTime || isNaN(endTime.getTime())) {
                await interaction.reply({ content: 'Invalid duration or date format. Use "1h", "30m" or "DD.MM HH:mm".', flags: MessageFlags.Ephemeral });
                return;
            }

            if (endTime.getTime() <= Date.now()) {
                await interaction.reply({ content: 'End time must be in the future.', flags: MessageFlags.Ephemeral });
                return;
            }

            draft.endTime = endTime;

            // --- Winners Logic ---
            if (winnersInput) {
                const winners = parseInt(winnersInput);
                if (isNaN(winners) || winners < 1) {
                    await interaction.reply({ content: 'Invalid number of winners.', flags: MessageFlags.Ephemeral });
                    return;
                }
                draft.winners = winners;
            } else if (!draft.winners) {
                // Default to 1 if not set and not provided
                draft.winners = 1;
            }

        } else if (action === 'step3') {
            // Scheduling Logic
            const scheduleInput = interaction.fields.getTextInputValue('schedule');
            // TODO: Validate/Save schedule
            // For now just ack
            if (scheduleInput) {
                // Mock saving schedule
                // draft.schedule = scheduleInput; 
                await interaction.reply({ content: `Schedule "${scheduleInput}" set! (Mock)`, flags: MessageFlags.Ephemeral });
                return; // Don't verify/update wizard for mock
            }
            // If empty, maybe clear schedule?
        } else if (action === 'template') {
            // Save Template Logic
            const templateName = interaction.fields.getTextInputValue('template_name');
            // TODO: Persist template
            // templateService.createTemplate(...)

            await interaction.reply({ content: `Template "${templateName}" saved! (Mock)`, flags: MessageFlags.Ephemeral });
            return; // Exit here as we don't need to update the wizard UI for this action primarily, or maybe we do?
            // Actually, we usually just say "Saved" and user continues wizard.
        }

        // Update cache
        giveawayCache.save(draft, draftId);

        // Update Wizard Message
        // Update Wizard Message
        const locale = interaction.locale;
        const lang = locale.startsWith('de') ? 'de' : 'en';

        // Fetch templates
        const templates = await templateService.getTemplates(interaction.guildId!);
        const container = wizardGiveawayContainer(lang, draftId, draft, templates);

        if (interaction.isFromMessage()) {
            await interaction.update({
                components: [container as any],
                flags: MessageFlags.IsComponentsV2
            });
        } else {
            await interaction.reply({ content: 'Updated!', flags: MessageFlags.Ephemeral });
        }
    }
};

export default modal;
