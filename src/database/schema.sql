CREATE TABLE IF NOT EXISTS giveaways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    guild_id VARCHAR(255) NOT NULL,
    prize VARCHAR(255) NOT NULL,
    winners INT NOT NULL DEFAULT 1,
    end_time DATETIME NOT NULL,
    hosted_by VARCHAR(255) NOT NULL,
    ended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    giveaway_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
    UNIQUE KEY unique_entry (giveaway_id, user_id)
);
