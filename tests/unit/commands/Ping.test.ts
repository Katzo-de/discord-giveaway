import { describe, it, expect, vi, beforeEach } from 'vitest';
import PingCommand from '../../../src/interaction/commands/Ping';
import { Bot } from '../../../src/Bot';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

vi.mock('discord.js', async () => {
    const actual = await vi.importActual<typeof import('discord.js')>('discord.js');
    return {
        ...actual,
    };
});

describe('Ping Command', () => {
    let mockBot: Bot;
    let mockInteraction: ChatInputCommandInteraction;

    beforeEach(() => {
        mockBot = {} as unknown as Bot;
        mockInteraction = {
            options: {
                getString: vi.fn(),
            },
            reply: vi.fn(),
        } as unknown as ChatInputCommandInteraction;
    });

    it('should reply with Pong!', async () => {
        vi.mocked(mockInteraction.options.getString).mockReturnValue(null);

        await PingCommand.execute(mockBot, mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral
        });
    });

    it('should reply with Pong! and echo', async () => {
        const echoMessage = 'Hello World';
        vi.mocked(mockInteraction.options.getString).mockReturnValue(echoMessage);

        await PingCommand.execute(mockBot, mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith({
            content: `Pong! You said: ${echoMessage}`,
            flags: MessageFlags.Ephemeral
        });
    });
});
