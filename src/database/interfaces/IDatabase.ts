export interface IDatabase {
    /**
     * Executes a query with optional parameters.
     * @param sql The SQL query string.
     * @param params Parameters to bind to the query.
     */
    query(sql: string, params?: any[]): Promise<any>;

    /**
     * Executes a query that doesn't return data (like INSERT, UPDATE, DELETE).
     * @param sql The SQL query string.
     * @param params Parameters to bind to the query.
     */
    execute(sql: string, params?: any[]): Promise<any>;

    /**
     * Closes the database connection.
     */
    close(): Promise<void>;

    /**
     * Retrieves guild settings.
     * @param guildId The ID of the guild.
     */
    getGuildSettings(guildId: string): Promise<import('../../interface/GuildSettings').GuildSettings | null>;

    /**
     * Sets or updates guild settings.
     * @param guildId The ID of the guild.
     * @param settings The settings to update.
     */
    setGuildSettings(guildId: string, settings: Partial<import('../../interface/GuildSettings').GuildSettings>): Promise<void>;
}
