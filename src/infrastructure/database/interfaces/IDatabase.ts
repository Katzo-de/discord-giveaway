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
}
