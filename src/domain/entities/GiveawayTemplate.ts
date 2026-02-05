export interface GiveawayTemplate {
    id: number;
    guild_id: string;
    name: string;
    title: string;
    description: string;
    prize: string;
    duration: string; // Stored as ISO duration string or human readable? usually string like '10m' based on previous adapter
    created_at: Date;
}
