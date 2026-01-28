import { Event } from '../interface/Event';

const event: Event<'ready'> = {
    name: 'ready',
    once: true,
    execute: (client) => {
        console.log(`Logged in as ${client.user?.tag}!`);
    },
};

export default event;
