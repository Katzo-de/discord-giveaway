import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Bot } from '../../src/Bot';
import { InteractionHandler } from '../../src/handlers/InteractionHandler';
import { EventHandler } from '../../src/handlers/EventHandler';

// Mock the handlers
vi.mock('../../src/handlers/InteractionHandler');
vi.mock('../../src/handlers/EventHandler');
vi.mock('discord.js', async () => {
    const actual = await vi.importActual('discord.js');
    return {
        ...actual,
        Client: class {
            login = vi.fn().mockResolvedValue('token');
            // Add other used methods if necessary
        },
    };
});

describe('Bot', () => {
    let bot: Bot;

    beforeEach(() => {
        vi.clearAllMocks();
        bot = new Bot();
    });

    it('should be instantiated', () => {
        expect(bot).toBeDefined();
        expect(bot).toBeInstanceOf(Bot);
    });

    it('should initialize handlers', () => {
        expect(bot.interactionHandler).toBeDefined();
        expect(bot.eventHandler).toBeDefined();
        expect(InteractionHandler).toHaveBeenCalledWith(bot);
        expect(EventHandler).toHaveBeenCalledWith(bot);
    });

    it('should start properly', async () => {
        process.env.DISCORD_TOKEN = 'test-token';
        
        await bot.start();

        expect(bot.login).toHaveBeenCalledWith('test-token');
        expect(bot.interactionHandler.loadInteractions).toHaveBeenCalled();
        expect(bot.eventHandler.loadEvents).toHaveBeenCalled();
    });
});
