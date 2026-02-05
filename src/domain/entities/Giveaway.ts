export interface Giveaway {
    id: number;
    message_id: string;
    channel_id: string;
    guild_id: string;
    title: string;
    description: string;
    prize: string;
    winners: number;
    end_time: Date;
    hosted_by: string;
    ended: boolean;
    created_at: Date;
    ping_role_id?: string;
}

export interface GiveawayEntry {
    id: number;
    giveaway_id: number;
    user_id: string;
    entry_time: Date;
}
