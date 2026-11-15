export type SqlValue = string | number | null;

export async function all<T>(
  db: D1Database,
  query: string,
  bindings: SqlValue[] = [],
): Promise<T[]> {
  const result = await db
    .prepare(query)
    .bind(...bindings)
    .all<T>();
  return result.results ?? [];
}

export async function first<T>(
  db: D1Database,
  query: string,
  bindings: SqlValue[] = [],
): Promise<T | null> {
  return db
    .prepare(query)
    .bind(...bindings)
    .first<T>();
}

export async function execute(
  db: D1Database,
  query: string,
  bindings: SqlValue[] = [],
): Promise<D1Result> {
  return db
    .prepare(query)
    .bind(...bindings)
    .run();
}
