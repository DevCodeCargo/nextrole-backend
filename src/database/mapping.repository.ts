import { Knex } from "knex";

type DbExecutor = Knex | Knex.Transaction;

abstract class MultiValueRepository<
  T extends Record<string, any>
> {
  constructor(
    protected readonly tableName: string
  ) { }

  // ---------------------------
  // INSERT (Single or Multiple)
  // ---------------------------
  async insert(
    db: DbExecutor,
    data: T | T[]
  ): Promise<T> {
    const rows = await db<T>(this.tableName)
      .insert(data as any)
      .returning("*");

    return (Array.isArray(data) ? rows : rows[0]) as any;
  }

  // ---------------------------
  // DELETE BY SINGLE COLUMN
  // ---------------------------
  async deleteByColumn<K extends keyof T>(
    db: DbExecutor,
    column: K,
    value: T[K]
  ): Promise<number> {
    return db<T>(this.tableName)
      .where(column as string, value)
      .delete();
  }

  // ---------------------------
  // DELETE BY WHERE OBJECT
  // ---------------------------
  async deleteWhere(
    db: DbExecutor,
    where: Partial<T>
  ): Promise<number> {
    return db<T>(this.tableName)
      .where(where)
      .delete();
  }
}