import { Collection, REST, Routes } from 'discord.js';
import { Bot } from '../Bot';
import { Command } from '../interface/Command';
import { Button, Modal } from '../interface/Component';
import * as fs from 'fs';
import * as path from 'path';

export class InteractionHandler {
    public commands: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Button> = new Collection();
    public modals: Collection<string, Modal> = new Collection();

    constructor(private client: Bot) {}

    public async loadInteractions() {
        await this.loadCommands();
        await this.loadButtons();
        await this.loadModals();
        await this.registerCommands();
    }

    private async loadCommands() {
        const commandsPath = path.join(__dirname, '../interaction/commands');
        if (!fs.existsSync(commandsPath)) return;

        const commandFiles = this.getFiles(commandsPath);

        for (const file of commandFiles) {
            const { default: command } = await import(file);
            if (!command || !command.data || !command.execute) continue;
            this.commands.set(command.data.name, command);
        }
    }

    private async loadButtons() {
        const buttonsPath = path.join(__dirname, '../interaction/buttons');
        if (!fs.existsSync(buttonsPath)) return;

        const buttonFiles = this.getFiles(buttonsPath);

        for (const file of buttonFiles) {
            const { default: button } = await import(file);
            if (!button || !button.customId || !button.execute) continue;
            this.buttons.set(button.customId, button);
        }
    }

    private async loadModals() {
        const modalsPath = path.join(__dirname, '../interaction/modals');
        if (!fs.existsSync(modalsPath)) return;

        const modalFiles = this.getFiles(modalsPath);

        for (const file of modalFiles) {
            const { default: modal } = await import(file);
            if (!modal || !modal.customId || !modal.execute) continue;
            this.modals.set(modal.customId, modal);
        }
    }

    private getFiles(dir: string): string[] {
        const files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                files.push(...this.getFiles(path.join(dir, item.name)));
            } else if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                files.push(path.join(dir, item.name));
            }
        }

        return files;
    }
    private async registerCommands() {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        const commandsData = this.commands.map(command => command.data.toJSON());

        try {
            console.log('Started refreshing application (/) commands.');

            if (process.env.GUILD_ID) {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID),
                    { body: commandsData },
                );
                console.log(`Successfully reloaded application (/) commands for guild ${process.env.GUILD_ID}.`);
            } else {
                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID!),
                    { body: commandsData },
                );
                console.log('Successfully reloaded application (/) commands globally.');
            }

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
}
