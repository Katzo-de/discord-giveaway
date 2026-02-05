export class QueryBuilder {
    private _table: string = '';
    private _select: string[] = [];
    private _where: { column: string; operator: string; value: any }[] = [];
    private _insert: Record<string, any> | null = null;
    private _update: Record<string, any> | null = null;
    private _delete: boolean = false;
    private _limit: number | null = null;

    table(name: string): this {
        this._table = name;
        return this;
    }

    select(...columns: string[]): this {
        this._select = columns;
        return this;
    }

    where(column: string, operator: string, value: any): this {
        this._where.push({ column, operator, value });
        return this;
    }

    insert(data: Record<string, any>): this {
        this._insert = data;
        return this;
    }

    update(data: Record<string, any>): this {
        this._update = data;
        return this;
    }

    delete(): this {
        this._delete = true;
        return this;
    }

    limit(count: number): this {
        this._limit = count;
        return this;
    }

    build(): { sql: string; params: any[] } {
        if (!this._table) {
            throw new Error('Table name is required');
        }

        const params: any[] = [];
        let sql = '';

        if (this._insert) {
            const keys = Object.keys(this._insert);
            const values = Object.values(this._insert);
            const placeholders = keys.map(() => '?').join(', ');
            sql = `INSERT INTO ${this._table} (${keys.join(', ')}) VALUES (${placeholders})`;
            params.push(...values);
        } else if (this._update) {
            const keys = Object.keys(this._update);
            const setClause = keys.map((key) => `${key} = ?`).join(', ');
            sql = `UPDATE ${this._table} SET ${setClause}`;
            params.push(...Object.values(this._update));
            this.appendWhere(sql, params);
        } else if (this._delete) {
            sql = `DELETE FROM ${this._table}`;
            this.appendWhere(sql, params);
        } else {
            const columns = this._select.length > 0 ? this._select.join(', ') : '*';
            sql = `SELECT ${columns} FROM ${this._table}`;
            const { sql: whereSql, params: whereParams } = this.buildWhere();
            sql += whereSql;
            params.push(...whereParams);
        }

        // Handle WHERE params for UPDATE/DELETE which are appended differently in logic above
        if (this._update || this._delete) {
            const { sql: whereSql, params: whereParams } = this.buildWhere();
            sql += whereSql;
            params.push(...whereParams);
        }


        if (this._limit) {
            sql += ` LIMIT ?`;
            params.push(this._limit);
        }

        return { sql, params };
    }

    private buildWhere(): { sql: string; params: any[] } {
        if (this._where.length === 0) {
            return { sql: '', params: [] };
        }

        const clauses = this._where.map((w) => `${w.column} ${w.operator} ?`);
        return {
            sql: ` WHERE ${clauses.join(' AND ')}`,
            params: this._where.map((w) => w.value)
        };
    }

    private appendWhere(sql: string, params: any[]) {
        // helper not really needed with current logic structure but kept as placeholder
    }
}
