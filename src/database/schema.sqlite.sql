CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    winners INTEGER NOT NULL DEFAULT 1,
    end_time TEXT NOT NULL,
    hosted_by TEXT NOT NULL,
    ended INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    entry_time TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
    UNIQUE (giveaway_id, user_id)
);
