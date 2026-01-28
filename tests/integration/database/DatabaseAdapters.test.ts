import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseFactory } from '../../../src/database/DatabaseFactory';
import { IDatabase } from '../../../src/database/interfaces/IDatabase';
import fs from 'fs';
import path from 'path';

describe('Database Integration Tests', () => {
  // We will test with SQLite for local integration testing as it requires no external setup
  // In CI we can add more tests for MySQL/Postgres if services are available
  const testDbFile = path.join(__dirname, 'test.sqlite');
  let db: IDatabase;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.DB_TYPE = 'sqlite';
    process.env.DB_FILENAME = testDbFile;

    db = DatabaseFactory.createDatabase();
    // Connection is likely handled separately or implicitly, checking adapter...
    // Based on IDatabase, there is no connect() method required.
    // If specific adapters need it, it should be in the interface or handled by factory.
    // Assuming for now it's implicit or not needed for the interface contract.
    
    // Initialize schema
    const schemaPath = path.join(__dirname, '../../../src/database/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
     const queries = schema.split(';').filter((query) => query.trim().length > 0);

    for (const query of queries) {
      await db.execute(query);
    }
  });

  afterAll(async () => {
    await db.close();
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
  });

  it('should insert and retrieve a giveaway', async () => {
    const giveaway = {
      message_id: '12345',
      channel_id: '67890',
      guild_id: '11122',
      prize: 'Test Prize',
      winners: 1,
      end_time: '2025-12-31 23:59:59',
      hosted_by: 'User1',
      ended: false
    };

    const insertQuery = `
      INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winners, end_time, hosted_by, ended)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(insertQuery, [
      giveaway.message_id,
      giveaway.channel_id,
      giveaway.guild_id,
      giveaway.prize,
      giveaway.winners,
      giveaway.end_time,
      giveaway.hosted_by,
      giveaway.ended ? 1 : 0
    ]);

    const selectQuery = 'SELECT * FROM giveaways WHERE message_id = ?';
    const result = await db.query(selectQuery, [giveaway.message_id]) as any[];

    expect(result.length).toBe(1);
    expect(result[0].prize).toBe(giveaway.prize);
    expect(result[0].hosted_by).toBe(giveaway.hosted_by);
  });
});
