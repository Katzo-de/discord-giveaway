import { IRecurringGiveawayRepository } from '../../domain/repositories/IRecurringGiveawayRepository';
import { IGiveawayRepository } from '../../domain/repositories/IGiveawayRepository';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { RecurringGiveaway } from '../../domain/entities/RecurringGiveaway';
import { parseDuration } from '../../utils/timeUtils';
import { Bot } from '../../Bot';
import { TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { createGiveawayContainer } from '../../utils/giveawayUtils';
import { settingsService } from '../../container';

export class RecurringGiveawayService {
    constructor(
        private readonly recurringRepository: IRecurringGiveawayRepository,
        private readonly giveawayRepository: IGiveawayRepository,
        private readonly templateRepository: ITemplateRepository
    ) { }


    async createRecurringGiveaway(data: Omit<RecurringGiveaway, 'id' | 'last_run_at' | 'active'>): Promise<RecurringGiveaway> {
        return this.recurringRepository.create({
            ...data,
            active: true
        });
    }

    async getRecurringGiveaways(guildId: string): Promise<RecurringGiveaway[]> {
        return this.recurringRepository.getByGuildId(guildId);
    }

    async deleteRecurringGiveaway(id: number): Promise<void> {
        await this.recurringRepository.delete(id);
    }

    async processDueGiveaways(client: Bot): Promise<void> {
        const activeRecurring = await this.recurringRepository.getAllActive();
        const now = new Date();

        for (const recurring of activeRecurring) {
            try {
                const lastRun = recurring.last_run_at ? new Date(recurring.last_run_at) : null;

                // If never run, or due for next run
                if (!lastRun || (now.getTime() - lastRun.getTime()) >= recurring.interval_ms) {
                    await this.triggerGiveaway(client, recurring);
                }
            } catch (error) {
                console.error(`Error processing recurring giveaway ${recurring.id}:`, error);
            }
        }
    }

    private async triggerGiveaway(client: Bot, recurring: RecurringGiveaway): Promise<void> {
        const template = await this.templateRepository.getById(recurring.template_id);
        if (!template) {
            console.error(`Template ${recurring.template_id} not found for recurring giveaway ${recurring.id}`);
            // Disable recurring giveaway?
            return;
        }

        // Calculate end time
        const durationMs = parseDuration(template.duration);
        if (!durationMs) {
            console.error(`Invalid duration in template ${template.name} for recurring giveaway ${recurring.id}`);
            return;
        }

        const endTime = new Date(Date.now() + durationMs);

        // Create Giveaway in DB
        const giveaway = await this.giveawayRepository.create({
            message_id: 'PENDING', // Will update after sending
            channel_id: recurring.channel_id,
            guild_id: recurring.guild_id,
            title: template.title,
            description: template.description,
            prize: template.prize,
            winners: recurring.winners_count,
            end_time: endTime,
            hosted_by: recurring.hosted_by,
            ping_role_id: recurring.ping_role_id
        });

        // Send Message
        try {
            const channel = await client.channels.fetch(recurring.channel_id) as TextChannel;
            if (channel && channel.isSendable()) {

                let content = '';
                if (giveaway.ping_role_id) {
                    content = `<@&${giveaway.ping_role_id}>`;
                }

                // Fetch Guild Settings for Language
                const settings = await settingsService.getSettings(recurring.guild_id);
                const lang = settings.language;

                // Construct Container
                const container = createGiveawayContainer(
                    giveaway.title,
                    giveaway.description,
                    giveaway.prize,
                    giveaway.end_time,
                    giveaway.hosted_by,
                    0, // 0 participants
                    giveaway.id,
                    giveaway.winners,
                    lang
                );

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`giveaway_join_${giveaway.id}`)
                            .setLabel('🎉 Join')
                            .setStyle(ButtonStyle.Primary)
                    );

                const message = await channel.send({
                    content: content || undefined,
                    components: [container as any, row],
                    flags: MessageFlags.IsComponentsV2
                });

                // Update message ID in DB
                giveaway.message_id = message.id;
                await this.giveawayRepository.update(giveaway);

                // Update Recurring Giveaway last_run_at
                recurring.last_run_at = new Date();
                await this.recurringRepository.update(recurring);

                console.log(`Triggered recurring giveaway ${recurring.id}, created giveaway ${giveaway.id}`);

            } else {
                console.error(`Channel ${recurring.channel_id} not found or not sendable for recurring giveaway ${recurring.id}`);
            }
        } catch (error) {
            console.error(`Failed to send giveaway message for recurring giveaway ${recurring.id}:`, error);
            // Delete the created giveaway entry since message failed?
            // await this.giveawayRepository.delete(giveaway.id); 
        }
    }
}
