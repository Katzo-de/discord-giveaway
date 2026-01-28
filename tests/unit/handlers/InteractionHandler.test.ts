import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InteractionHandler } from '../../../src/handlers/InteractionHandler';
import { Bot } from '../../../src/Bot';
import { Collection, REST } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock everything
vi.mock('discord.js', async () => {
    const actual = await vi.importActual<typeof import('discord.js')>('discord.js');
    return {
        ...actual,
        REST: class {
            setToken = vi.fn().mockReturnThis();
            put = vi.fn().mockResolvedValue([]);
        },
    };
});
vi.mock('fs');
vi.mock('../../../src/Bot');

describe('InteractionHandler', () => {
    let handler: InteractionHandler;
    let mockBot: Bot;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.DISCORD_TOKEN = 'test-token';
        process.env.CLIENT_ID = 'test-client-id';
        mockBot = new Bot();
        handler = new InteractionHandler(mockBot);
    });

    it('should be instantiated', () => {
        expect(handler).toBeDefined();
        expect(handler.commands).toBeInstanceOf(Collection);
    });

    it('should handle missing directories gracefully', async () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(false);
        
        await handler.loadInteractions();

        expect(handler.commands.size).toBe(0);
        expect(handler.buttons.size).toBe(0);
        expect(handler.modals.size).toBe(0);
    });
});
