import { IDatabase } from './interfaces/IDatabase';
import { MysqlAdapter } from './adapters/MysqlAdapter';
import { SqliteAdapter } from './adapters/SqliteAdapter';
import { PostgresAdapter } from './adapters/PostgresAdapter';

export class DatabaseFactory {
    public static createDatabase(): IDatabase {
        const type = process.env.DB_TYPE || 'mysql';

        switch (type.toLowerCase()) {
            case 'sqlite':
                return new SqliteAdapter();
            case 'postgres':
            case 'postgresql':
                return new PostgresAdapter();
            case 'mysql':
            default:
                return new MysqlAdapter();
        }
    }
}
