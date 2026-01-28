import { config } from 'dotenv';
import { Bot } from './Bot';

config();

const client = new Bot();

client.start();
