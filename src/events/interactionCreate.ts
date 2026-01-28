import { Event } from '../interface/Event';
import { Interaction } from 'discord.js';

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
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            const button = client.interactionHandler.buttons.get(interaction.customId);
            if (!button) return;

            try {
                await button.execute(client, interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
            }
        } else if (interaction.isModalSubmit()) {
            const modal = client.interactionHandler.modals.get(interaction.customId);
            if (!modal) return;

            try {
                await modal.execute(client, interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this modal!', ephemeral: true });
            }
        }
    },
};

export default event;
