CREATE TABLE IF NOT EXISTS giveaways (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    guild_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prize VARCHAR(255) NOT NULL,
    winners INT NOT NULL DEFAULT 1,
    end_time TIMESTAMP NOT NULL,
    hosted_by VARCHAR(255) NOT NULL,
    ping_role_id VARCHAR(255),
    giveaway_role_id VARCHAR(255),
    ended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    id SERIAL PRIMARY KEY,
    giveaway_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
    UNIQUE (giveaway_id, user_id)
);

CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id VARCHAR(255) PRIMARY KEY,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    manager_role_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS giveaway_templates (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prize VARCHAR(255) NOT NULL,
    duration VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (guild_id, name)
);

CREATE TABLE IF NOT EXISTS recurring_giveaways (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    template_id INT NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    interval_ms BIGINT NOT NULL,
    winners_count INT NOT NULL DEFAULT 1,
    hosted_by VARCHAR(255) NOT NULL DEFAULT 'Bot',
    ping_role_id VARCHAR(255),
    last_run_at TIMESTAMP NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (template_id) REFERENCES giveaway_templates(id) ON DELETE CASCADE
);
