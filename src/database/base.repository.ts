import { Knex } from "knex";

type DbExecutor = Knex | Knex.Transaction;

/**
 * Fields that should not be inserted manually
 */
type Insertable<T, PK extends keyof T> = Omit<T, PK>;

/**
 * Update should never allow primary key modification
 */
type Updatable<T, PK extends keyof T> = Partial<Omit<T, PK>>;

export abstract class BaseRepository<
  T extends Record<string, any>,
  PK extends keyof T
> {
  constructor(
    protected readonly tableName: string,
    protected readonly keyName: PK
  ) { }

  // ---------------------------
  // FIND ONE
  // ---------------------------
  async findOne(
    db: DbExecutor,
    where: Partial<T>
  ): Promise<T | undefined> {
    return db(this.tableName)
      .where(where)
      .first<T>();
  }

  // ---------------------------
  // FIND ALL
  // ---------------------------
  async findAll(
    db: DbExecutor,
    where: Partial<T>
  ): Promise<T[]> {
    return db(this.tableName)
      .where(where)
      .select<T>();
  }

  // ---------------------------
  // INSERT (Single or Multiple)
  // ---------------------------
  async insert(
    db: DbExecutor,
    data: Insertable<T, PK> | Insertable<T, PK>[]
  ): Promise<T> {
    const rows = await db<T>(this.tableName)
      .insert(data as any)
      .returning("*");

    return (Array.isArray(data) ? rows : rows[0]) as any;
  }

  // ---------------------------
  // UPDATE BY PRIMARY KEY
  // ---------------------------
  async update(
    db: DbExecutor,
    id: T[PK],
    data: Updatable<T, PK>
  ): Promise<T | undefined> {
    const whereClause: Pick<T, PK> = {
      [this.keyName]: id,
    } as Pick<T, PK>;

    const rows = await db(this.tableName)
      .where(whereClause)
      .update(data)
      .returning<T>("*");

    return rows[0];
  }

  // ---------------------------
  // DELETE BY PRIMARY KEY
  // ---------------------------
  async delete(
    db: DbExecutor,
    id: T[PK]
  ): Promise<boolean> {

    const whereClause: Pick<T, PK> = {
      [this.keyName]: id,
    } as Pick<T, PK>;

    const affected = await db<T>(this.tableName)
      .where(whereClause)
      .delete();

    return affected > 0;
  }

  // ---------------------------
  // DELETE BY WHERE CONDITION
  // ---------------------------
  async deleteBy(
    db: DbExecutor,
    where: Record<string, any>
  ): Promise<boolean> {

    const affected = await db<T>(this.tableName)
      .where(where)
      .delete();

    return affected > 0;
  }

}