export interface RecurringGiveaway {
    id: number;
    guild_id: string;
    template_id: number;
    channel_id: string;
    interval_ms: number;
    winners_count: number;
    ping_role_id?: string;
    last_run_at?: Date;
    active: boolean;
}
