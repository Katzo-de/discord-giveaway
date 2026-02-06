import { DatabaseFactory } from './infrastructure/database/DatabaseFactory';
import { DbGiveawayRepository } from './infrastructure/repositories/generic/DbGiveawayRepository';
import { DbTemplateRepository } from './infrastructure/repositories/generic/DbTemplateRepository';
import { DbSettingsRepository } from './infrastructure/repositories/generic/DbSettingsRepository';
import { DbRecurringGiveawayRepository } from './infrastructure/repositories/generic/DbRecurringGiveawayRepository';
import { GiveawayService } from './application/services/GiveawayService';
import { TemplateService } from './application/services/TemplateService';
import { SettingsService } from './application/services/SettingsService';

// Database Driver
export const dbAdapter = DatabaseFactory.createDatabase();

// Repositories
export const giveawayRepository = new DbGiveawayRepository(dbAdapter);
export const templateRepository = new DbTemplateRepository(dbAdapter);
export const settingsRepository = new DbSettingsRepository(dbAdapter);
export const recurringRepository = new DbRecurringGiveawayRepository(dbAdapter);

// Services
export const giveawayService = new GiveawayService(giveawayRepository);
export const templateService = new TemplateService(templateRepository);
export const settingsService = new SettingsService(settingsRepository);
// Import RecurringGiveawayService here because we need it
import { RecurringGiveawayService } from './application/services/RecurringGiveawayService';
export const recurringService = new RecurringGiveawayService(recurringRepository, giveawayRepository, templateRepository);

// We need to inject client into RecurringGiveawayService.
// However, client is created in index.ts which imports container. Circular?
// Usually container exports instances. If Service needs Client, we can inject it later or pass it in method.
// But Service constructor requires it.
// Let's defer instantiation of RecurringGiveawayService or use a factory/setter?
// Or we can modify RecurringGiveawayService to not take Client in constructor, but pass it to `processDueGiveaways(client)`.
// Let's modify RecurringGiveawayService to take client in processDueGiveaways.

