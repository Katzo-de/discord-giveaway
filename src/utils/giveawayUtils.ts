import { ActionRowBuilder, ButtonStyle, EmbedBuilder, Client, MessageFlags, SeparatorSpacingSize, RoleSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { Bot } from '../Bot';
import { giveawayService, settingsService } from '../container';
import { StringSelectMenuBuilder, ContainerBuilder, TextDisplayBuilder, ButtonBuilder } from '@discordjs/builders';
import { getTranslation } from './languageUtils';
import { GuildSettings } from '../domain/entities/GuildSettings';

export interface GiveawayResult {
    success: boolean;
    message: string;
    winnerIds?: string[];
}

export async function endGiveaway(client: Bot, giveawayId: number): Promise<GiveawayResult> {
    try {
        // Fetch giveaway to check status and get message details
        // We use service to end it, which handles DB update and winner selection
        let winners: string[] = [];
        let giveaway = await giveawayService.getGiveaway(giveawayId);

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        if (giveaway.ended) {
            return { success: false, message: 'This giveaway has already ended.' };
        }

        // End the giveaway via service
        // Service.endGiveaway returns winners
        winners = await giveawayService.endGiveaway(giveawayId);

        // Re-fetch giveaway to ensure we have latest state (though endGiveaway updates passed object in memory? 
        // Service code: "giveaway.ended = true; await update(giveaway);" 
        // But our local 'giveaway' var here is a different copy if getGiveaway fetched a new object. 
        // Service fetches it internally.
        // So we update our local object state or re-fetch.
        giveaway.ended = true;

        // Fetch guild settings for language
        const settings = await settingsService.getSettings(giveaway.guild_id);
        const lang = settings.language;

        if (giveaway.message_id === 'DRAFT') {
            return { success: true, message: 'Draft giveaway ended (cleaned up).' };
        }

        // Get entries count for message
        const entryCount = await giveawayService.getEntryCount(giveawayId);
        // Note: winners are returned by service endGiveaway which picked them from DB state before update? Yes.

        // Update original message
        try {
            const channel = await client.channels.fetch(giveaway.channel_id).catch(e => {
                console.error(`[GiveawayEnd] Failed to fetch channel ${giveaway.channel_id}:`, e);
                return null;
            });

            if (channel && (channel.isSendable() || channel.isTextBased())) {
                const message = await channel.messages.fetch(giveaway.message_id).catch((e) => {
                    console.error(`[GiveawayEnd] Failed to fetch message ${giveaway.message_id} in channel ${giveaway.channel_id}:`, e);
                    return null;
                });

                if (message) {
                    // Rebuild Container for Ended State
                    const container = new ContainerBuilder();

                    const titleDisplay = new TextDisplayBuilder()
                        .setContent(`# 🛑 [${getTranslation('giveaway.ended', lang).toUpperCase()}] ${giveaway.title} 🛑`);

                    const descDisplay = new TextDisplayBuilder()
                        .setContent(giveaway.description);

                    const winnersText = winners.length > 0
                        ? winners.map(id => `<@${id}>`).join(', ')
                        : getTranslation('giveaway.ended.no_winners', lang);

                    const infoDisplay = new TextDisplayBuilder()
                        .setContent(`🏆 **${getTranslation('giveaway.prize', lang)}:** ${giveaway.prize}\n👑 **${getTranslation('giveaway.winners', lang)}:** ${winnersText}\n👤 **${getTranslation('giveaway.hosted_by', lang)}:** <@${giveaway.hosted_by}>\n👥 **${getTranslation('giveaway.participants', lang)}:** ${entryCount}`);

                    const footerDisplay = new TextDisplayBuilder()
                        .setContent(`${getTranslation('giveaway.ended', lang)} • ID: ${giveaway.id}`);

                    container.addTextDisplayComponents(titleDisplay, descDisplay, infoDisplay, footerDisplay);

                    // Disable buttons
                    const row = new ActionRowBuilder<ButtonBuilder>();

                    const disabledButton = new ButtonBuilder()
                        .setCustomId('giveaway_ended')
                        .setLabel(getTranslation('giveaway.ended', lang))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    row.addComponents(disabledButton);

                    try {
                        await message.edit({
                            components: [container as any, row],
                            flags: MessageFlags.IsComponentsV2
                        });
                        console.log(`[GiveawayEnd] Successfully updated giveaway embed ${giveaway.id}`);
                    } catch (editError) {
                        console.error(`[GiveawayEnd] Failed to edit message embed for ${giveaway.id}:`, editError);
                    }

                    // Announce winner as a reply to the giveaway message
                    try {
                        if (winners.length > 0) {
                            const winnersString = winners.map(id => `<@${id}>`).join(', ');
                            await message.reply({
                                content: getTranslation('giveaway.winner.message', lang, { winners: winnersString, prize: giveaway.prize })
                            });
                        } else {
                            await message.reply({
                                content: getTranslation('giveaway.no_entries', lang)
                            });
                        }
                        console.log(`[GiveawayEnd] Successfully announced winners for ${giveaway.id}`);
                    } catch (replyError) {
                        console.error(`[GiveawayEnd] Failed to reply with winners for ${giveaway.id}:`, replyError);
                    }
                } else {
                    console.warn(`[GiveawayEnd] Message ${giveaway.message_id} not found.`);
                }
            } else {
                console.warn(`[GiveawayEnd] Channel ${giveaway.channel_id} not found or not sendable. isSendable: ${channel?.isSendable()}`);
            }
        } catch (err) {
            console.error(`[GiveawayEnd] Critical error in message update block for giveaway ${giveawayId}:`, err);
        }

        if (winners.length > 0) {
            return { success: true, message: 'Giveaway ended successfully!', winnerIds: winners };
        } else {
            return { success: true, message: 'Giveaway ended (no participants).' };
        }

    } catch (error) {
        console.error('Error ending giveaway:', error);
        return { success: false, message: 'An error occurred while ending the giveaway.' };
    }
}

export async function rerollGiveaway(client: Bot, giveawayId: number): Promise<GiveawayResult> {
    try {
        const giveaway = await giveawayService.getGiveaway(giveawayId);

        if (!giveaway) {
            return { success: false, message: `Giveaway with ID ${giveawayId} not found.` };
        }

        // Reroll via service
        // Service.rerollGiveaway checks if ended, throws if not
        let winners: string[] = [];
        try {
            winners = await giveawayService.rerollGiveaway(giveawayId);
        } catch (e: any) {
            return { success: false, message: e.message };
        }

        if (winners.length === 0) {
            return { success: false, message: 'No entries found for this giveaway.' };
        }

        // Fetch guild settings for language
        const settings = await settingsService.getSettings(giveaway.guild_id);
        const lang = settings.language;

        const winnerId = winners[0];

        // Fetch and reply to the original message
        try {
            const channel = await client.channels.fetch(giveaway.channel_id);
            if (channel && channel.isSendable()) {
                const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                if (message) {
                    await message.reply({
                        content: getTranslation('giveaway.reroll.message', lang, { winner: `<@${winnerId}>` })
                    });
                }
            }
        } catch (err) {
            console.warn(`Could not fetch message for giveaway ${giveawayId} during reroll:`, err);
        }

        return { success: true, message: getTranslation('giveaway.reroll.success', lang, { winner: `<@${winnerId}>` }), winnerIds: [winnerId] };

    } catch (error) {
        console.error('Error rerolling giveaway:', error);
        return { success: false, message: 'An error occurred while rerolling the giveaway.' };
    }
}

export function createGiveawayContainer(
    title: string,
    description: string,
    prize: string,
    endTime: Date,
    hostedByUserId: string,
    participantCount: number,
    giveawayId?: number | string,
    winnerCount: number = 1,
    lang: string = 'en'
): ContainerBuilder {
    const container = new ContainerBuilder();

    const titleDisplay = new TextDisplayBuilder()
        .setContent(`# 🎉 ${title} 🎉`);

    const descDisplay = new TextDisplayBuilder()
        .setContent(description);

    const infoDisplay = new TextDisplayBuilder()
        .setContent(`🏆 **${getTranslation('giveaway.prize', lang)}:** ${prize}\n⏰ **${getTranslation('giveaway.ends', lang)}:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n👤 **${getTranslation('giveaway.hosted_by', lang)}:** <@${hostedByUserId}>\n👥 **${getTranslation('giveaway.participants', lang)}:** ${participantCount}\n🎫 **${getTranslation('giveaway.winners', lang)}:** ${winnerCount}`);

    const footerText = giveawayId ? `${getTranslation('giveaway.ends', lang)} • ID: ${giveawayId}` : `${getTranslation('giveaway.ends', lang)} • ID: (Pending)`;
    const footerDisplay = new TextDisplayBuilder()
        .setContent(footerText);

    container.addTextDisplayComponents(titleDisplay, descDisplay, infoDisplay, footerDisplay);

    return container;
}


export function wizardGiveawayContainer(lang: string = 'en', draftId?: string, draft?: any): ContainerBuilder { // draft type any for now or GiveawayData if imported
    const container = new ContainerBuilder();

    const idSuffix = draftId ? `:${draftId}` : '';

    container.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(`## 🎉 ${getTranslation('wizard.title', lang)}`),
        (textDisplay) => textDisplay.setContent(getTranslation('wizard.description', lang)),
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large))

    // Step 1
    const step1Title = draft?.title ? `✅ ${getTranslation('wizard.step1.title', lang)}` : `### ${getTranslation('wizard.step1.title', lang)}`;
    const step1Desc = draft?.title
        ? `**Title:** ${draft.title}\n**Prize:** ${draft.prize}`
        : getTranslation('wizard.step1.description', lang);

    container.addSectionComponents((section) =>
        section
            .addTextDisplayComponents(
                (textDisplay) => textDisplay.setContent(step1Title),
                (textDisplay) => textDisplay.setContent(step1Desc),
            )
            .setButtonAccessory((button) =>
                button.setCustomId(`wizard_step_1${idSuffix}`).setLabel(getTranslation('wizard.step1.button', lang)).setStyle(ButtonStyle.Primary),
            )
    ).addActionRowComponents((actionRow) =>
        actionRow.setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`wizard_template_select${idSuffix}`)
                .setPlaceholder(getTranslation('wizard.step1.select.placeholder', lang))
                .addOptions({
                    label: getTranslation('wizard.step1.select.no_templates', lang),
                    value: 'no_templates',
                    description: getTranslation('wizard.step1.select.create_template', lang)
                })
        ),
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // Step 2
    const step2Title = draft?.endTime ? `✅ ${getTranslation('wizard.step2.title', lang)}` : `### ${getTranslation('wizard.step2.title', lang)}`;
    let step2Desc = getTranslation('wizard.step2.description', lang);
    if (draft?.endTime) {
        step2Desc = `**Ends:** <t:${Math.floor(draft.endTime.getTime() / 1000)}:R>`;
        if (draft.winners) {
            step2Desc += `\n**Winners:** ${draft.winners}`;
        }
    }

    container.addSectionComponents((section) =>
        section
            .addTextDisplayComponents(
                (textDisplay) => textDisplay.setContent(step2Title),
                (textDisplay) => textDisplay.setContent(step2Desc),
            )
            .setButtonAccessory((button) =>
                button.setCustomId(`wizard_step_2${idSuffix}`).setLabel(getTranslation('wizard.step2.button', lang)).setStyle(ButtonStyle.Primary),
            ),
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // Step 3
    // Mock Schedule check - we don't have draft.schedule yet really, but let's assume if we did
    // or just show default for now since it's mock
    const step3Title = `### ${getTranslation('wizard.step3.title', lang)}`;
    // If we had provisions for schedule in draft, we'd check it here. 
    // For now, since it's mock, we always show default state (no checkmark) or maybe we check if user visited?
    // Let's keep it simple: No checkmark for optional mock step yet.

    const step3Desc = getTranslation('wizard.step3.description', lang);

    container.addSectionComponents((section) =>
        section
            .addTextDisplayComponents(
                (textDisplay) => textDisplay.setContent(step3Title),
                (textDisplay) => textDisplay.setContent(step3Desc),
            )
            .setButtonAccessory((button) =>
                button.setCustomId(`wizard_step_3${idSuffix}`).setLabel(getTranslation('wizard.step3.button', lang)).setStyle(ButtonStyle.Primary),
            ),
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    container.addTextDisplayComponents(
        (textDisplay) =>
            textDisplay.setContent(
                `### ${getTranslation('wizard.review.title', lang)}\n${getTranslation('wizard.review.description', lang)}`,
            ),
    );

    const isPublishable = draft?.title && draft?.endTime && draft?.winners;

    container.addActionRowComponents((actionRow) =>
        actionRow.setComponents(
            new ButtonBuilder().setCustomId(`wizard_preview${idSuffix}`).setLabel(getTranslation('wizard.button.preview', lang)).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`wizard_template${idSuffix}`).setLabel(getTranslation('wizard.button.template', lang)).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`wizard_publish${idSuffix}`).setLabel(getTranslation('wizard.button.publish', lang)).setStyle(isPublishable ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(!isPublishable)
        )
    );

    return container;
}

export function settingsContainer(settings: GuildSettings | null, lang: string): ContainerBuilder {
    const container = new ContainerBuilder();

    // 1. Header
    container.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(`## ${getTranslation('settings.title', lang)}`)
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // 2. Language Settings
    container.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(`### ${getTranslation('settings.language.name', lang)}`),
        (textDisplay) => textDisplay.setContent(getTranslation('settings.language.description', lang))
    ).addActionRowComponents((row) =>
        row.setComponents(
            new StringSelectMenuBuilder()
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
                )
        )
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // 3. Role Settings
    const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId('settings_role')
        .setPlaceholder(getTranslation('settings.role.name', lang));

    if (settings?.manager_role_id) {
        roleSelect.addDefaultRoles([settings.manager_role_id]);
    }

    container.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(`### ${getTranslation('settings.role.name', lang)}`),
        (textDisplay) => textDisplay.setContent(getTranslation('settings.role.description', lang))
    ).addActionRowComponents((row) =>
        row.setComponents(roleSelect)
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // 4. Schedule Management using ButtonAccessory (MUST be a Section)
    container.addSectionComponents((section) =>
        section
            .addTextDisplayComponents(
                (textDisplay) => textDisplay.setContent(`### ${getTranslation('settings.schedule.name', lang)}`),
                (textDisplay) => textDisplay.setContent(getTranslation('settings.schedule.description', lang))
            )
            .setButtonAccessory((button) =>
                button.setCustomId('settings_schedule_manage')
                    .setLabel(getTranslation('settings.schedule.button', lang))
                    .setStyle(ButtonStyle.Primary)
            )
    ).addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    // 5. Template Management (Action Row -> Direct)
    container.addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(`### ${getTranslation('settings.template.name', lang)}`),
        (textDisplay) => textDisplay.setContent(getTranslation('settings.template.description', lang))
    ).addActionRowComponents((row) =>
        row.setComponents(
            new ButtonBuilder()
                .setCustomId('template_create_btn')
                .setLabel(getTranslation('settings.template.create', lang))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('template_delete_btn')
                .setLabel(getTranslation('settings.template.delete', lang))
                .setStyle(ButtonStyle.Danger)
        )
    );

    return container;
}