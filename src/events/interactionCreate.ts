import { Event } from '../interface/Event';
import { Interaction, MessageFlags } from 'discord.js';

const event: Event<'interactionCreate'> = {
    name: 'interactionCreate',
    execute: async (client, interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            const command = client.interactionHandler.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(client, interaction);
            } catch (error) {
                console.error(error);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                    }
                } catch (err) {
                    console.error('Failed to send error message:', err);
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.interactionHandler.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(client, interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isButton()) {
            let button = client.interactionHandler.buttons.get(interaction.customId);

            // If no exact match, check for dynamic ID (prefix matching)
            if (!button) {
                const prefix = interaction.customId.split(':')[0];
                button = client.interactionHandler.buttons.get(prefix);
            }

            if (!button) return;

            try {
                await button.execute(client, interaction);
            } catch (error) {
                console.error(error);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this button!', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this button!', flags: MessageFlags.Ephemeral });
                    }
                } catch (err) {
                    console.error('Failed to send error message:', err);
                }
            }
        } else if (interaction.isModalSubmit()) {
            const modal = client.interactionHandler.modals.get(interaction.customId.split(':')[0]);
            if (!modal) return;

            try {
                await modal.execute(client, interaction);
            } catch (error) {
                console.error(error);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this modal!', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this modal!', flags: MessageFlags.Ephemeral });
                    }
                } catch (err) {
                    console.error('Failed to send error message:', err);
                }
            }
        } else if (interaction.isAnySelectMenu()) {
            let menu = client.interactionHandler.selectMenus.get(interaction.customId);

            // If no exact match, check for dynamic ID (prefix matching)
            if (!menu) {
                const prefix = interaction.customId.split(':')[0];
                menu = client.interactionHandler.selectMenus.get(prefix);
            }

            if (!menu) return;

            try {
                await menu.execute(client, interaction);
            } catch (error) {
                console.error(error);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this select menu!', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this select menu!', flags: MessageFlags.Ephemeral });
                    }
                } catch (err) {
                    console.error('Failed to send error message:', err);
                }
            }
        }
    },
};

export default event;
