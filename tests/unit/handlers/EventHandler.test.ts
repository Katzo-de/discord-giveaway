import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventHandler } from '../../../src/handlers/EventHandler';
import { Bot } from '../../../src/Bot';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('discord.js');
vi.mock('fs');
vi.mock('../../../src/Bot');

describe('EventHandler', () => {
    let handler: EventHandler;
    let mockBot: Bot;

    beforeEach(() => {
        vi.clearAllMocks();
        mockBot = new Bot();
        handler = new EventHandler(mockBot);
    });

    it('should be instantiated', () => {
        expect(handler).toBeDefined();
    });

    it('should handle missing directories gracefully', async () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(false);
        
        await handler.loadEvents();

        // Should not throw and essentially do nothing
        expect(true).toBe(true);
    });
});
