import { IDatabase } from '../interfaces/IDatabase';
import Database from 'better-sqlite3';
import path from 'path';

export class SqliteAdapter implements IDatabase {
    private db: Database.Database;

    constructor() {
        const dbPath = process.env.DB_FILENAME || 'giveaway.sqlite';
        this.db = new Database(dbPath);
    }

    async query(sql: string, params?: any[]): Promise<any> {
        // better-sqlite3 uses synchronous methods
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
}
