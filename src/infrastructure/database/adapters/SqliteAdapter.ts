import { IDatabase } from '../interfaces/IDatabase';
import Database from 'better-sqlite3';

export class SqliteAdapter implements IDatabase {
    private db: Database.Database;

    constructor() {
        const dbPath = process.env.DB_FILENAME || 'giveaway.sqlite';
        this.db = new Database(dbPath);
    }

    async query(sql: string, params?: any[]): Promise<any> {
        const stmt = this.db.prepare(sql);
        return stmt.all(params || []);
    }

    async execute(sql: string, params?: any[]): Promise<any> {
        const stmt = this.db.prepare(sql);
        const info = stmt.run(params || []);
        return {
            insertId: info.lastInsertRowid,
            affectedRows: info.changes
        };
    }

    async close(): Promise<void> {
        this.db.close();
    }

    // Legacy methods removed. Repositories should be used instead.
    // However, existing code might still call them if not refactored.
    // Ideally we remove them to force refactoring.
    // If I leave them, I must implement them.
    // I will REMOVE them. The compiler will guide me to fix remaining usages.
    // EXCEPT: Bot.ts was using `database` to potentially call these methods?
    // Start with Bot.ts refactor next.

    // Wait, the Interfaces defined earlier (IGuildSettingsRepository etc) are NOT implemented by this class anymore.
    // So if Bot.ts expects IDatabase to have those methods (from old definition), we have a problem.
    // But IDatabase interface definition was:
    // export interface IDatabase { query, execute, close, getGuildSettings... }?
    // YES. src/infrastructure/database/interfaces/IDatabase.ts defines getGuildSettings etc.
    // I MUST UPDATE IDatabase interface OR implement them here.

    // Clean Architecture: IDatabase should strictly be technical DB access.
    // I should REMOVE high-level methods from IDatabase.
    // And update Bot.ts to not expect them on `database`.
}
