import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interface/Command';
import { Bot } from '../../Bot';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gcreate')
        .setDescription('Create a new giveaway via setup wizard'),
    execute: async (client: Bot, interaction) => {
        const select = new StringSelectMenuBuilder()
            .setCustomId('giveaway_duration')
            .setPlaceholder('Select a duration for the giveaway')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('1 Hour').setValue('1h'),
                new StringSelectMenuOptionBuilder().setLabel('2 Hours').setValue('2h'),
                new StringSelectMenuOptionBuilder().setLabel('4 Hours').setValue('4h'),
                new StringSelectMenuOptionBuilder().setLabel('8 Hours').setValue('8h'),
                new StringSelectMenuOptionBuilder().setLabel('12 Hours').setValue('12h'),
                new StringSelectMenuOptionBuilder().setLabel('24 Hours').setValue('24h'),
                new StringSelectMenuOptionBuilder().setLabel('2 Days').setValue('2d'),
                new StringSelectMenuOptionBuilder().setLabel('5 Days').setValue('5d'),
                new StringSelectMenuOptionBuilder().setLabel('7 Days').setValue('7d'),

                new StringSelectMenuOptionBuilder().setLabel('Specific Date').setValue('Date'),
                new StringSelectMenuOptionBuilder().setLabel('Custom Duration').setValue('Custom')
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(select);

        await interaction.reply({
            content: 'Please select a duration for the giveaway:',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};

export default command;
