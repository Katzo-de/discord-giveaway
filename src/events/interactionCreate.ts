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
        } else if (interaction.isButton()) {
            const button = client.interactionHandler.buttons.get(interaction.customId);
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
            const modal = client.interactionHandler.modals.get(interaction.customId);
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
        }
    },
};

export default event;
