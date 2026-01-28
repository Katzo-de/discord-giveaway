import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { Bot } from '../Bot';

export interface Component {
    customId: string;
    execute: (client: Bot, interaction: any) => Promise<any>;
}

export interface Button extends Component {
    execute: (client: Bot, interaction: ButtonInteraction) => Promise<any>;
}

export interface Modal extends Component {
    execute: (client: Bot, interaction: ModalSubmitInteraction) => Promise<any>;
}

export interface SelectMenu extends Component {
    execute: (client: Bot, interaction: any) => Promise<any>;
}
