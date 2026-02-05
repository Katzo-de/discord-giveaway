import { DatabaseFactory } from './infrastructure/database/DatabaseFactory';
import { SqliteGiveawayRepository } from './infrastructure/repositories/sqlite/SqliteGiveawayRepository';
import { SqliteTemplateRepository } from './infrastructure/repositories/sqlite/SqliteTemplateRepository';
import { SqliteSettingsRepository } from './infrastructure/repositories/sqlite/SqliteSettingsRepository';
import { GiveawayService } from './application/services/GiveawayService';
import { TemplateService } from './application/services/TemplateService';
import { SettingsService } from './application/services/SettingsService';

// Database Driver
export const dbAdapter = DatabaseFactory.createDatabase();

// Repositories
export const giveawayRepository = new SqliteGiveawayRepository(dbAdapter);
export const templateRepository = new SqliteTemplateRepository(dbAdapter);
export const settingsRepository = new SqliteSettingsRepository(dbAdapter);

// Services
export const giveawayService = new GiveawayService(giveawayRepository);
export const templateService = new TemplateService(templateRepository);
export const settingsService = new SettingsService(settingsRepository);
