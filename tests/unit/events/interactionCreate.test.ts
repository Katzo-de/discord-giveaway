import { describe, it, expect, vi, beforeEach } from 'vitest';
import interactionCreate from '../../../src/events/interactionCreate';
import { Bot } from '../../../src/Bot';
import { ChatInputCommandInteraction, Interaction, Collection } from 'discord.js';
import { Command } from '../../../src/interface/Command';

vi.mock('discord.js', async () => {
    const actual = await vi.importActual<typeof import('discord.js')>('discord.js');
    return {
        ...actual,
    };
});

describe('interactionCreate Event', () => {
    let mockBot: Bot;
    let mockInteraction: Interaction;
    let mockCommands: Collection<string, Command>;

    beforeEach(() => {
        mockCommands = new Collection();
        mockBot = {
            interactionHandler: {
                commands: mockCommands,
                buttons: new Collection(),
                modals: new Collection(),
            },
        } as unknown as Bot;
    });

    it('should execute command if chat input command', async () => {
        const mockExecute = vi.fn();
        const commandName = 'test-command';
        mockCommands.set(commandName, {
            data: { name: commandName } as any,
            execute: mockExecute
        });

        mockInteraction = {
            isChatInputCommand: () => true,
            isButton: () => false,
            isModalSubmit: () => false,
            commandName: commandName,
        } as unknown as ChatInputCommandInteraction;

        await interactionCreate.execute(mockBot, mockInteraction);

        expect(mockExecute).toHaveBeenCalledWith(mockBot, mockInteraction);
    });

    it('should ignore if command not found', async () => {
        mockInteraction = {
            isChatInputCommand: () => true,
            isButton: () => false,
            isModalSubmit: () => false,
            commandName: 'unknown-command',
        } as unknown as ChatInputCommandInteraction;

        await interactionCreate.execute(mockBot, mockInteraction);

        // Should just return
    });
});
