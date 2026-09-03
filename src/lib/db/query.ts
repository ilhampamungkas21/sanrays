/**
 * Supabase Database Query Helper
 * Provides MySQL-compatible query interface using Supabase
 */

import { supabase } from './supabase';

export interface QueryOptions {
  table: string;
  select?: string;
  where?: Record<string, unknown>;
  whereIn?: { column: string; values: unknown[] };
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface InsertOptions {
  table: string;
  data: Record<string, unknown> | Record<string, unknown>[];
  returning?: boolean;
}

export interface UpdateOptions {
  table: string;
  data: Record<string, unknown>;
  where: Record<string, unknown>;
  returning?: boolean;
}

export interface DeleteOptions {
  table: string;
  where: Record<string, unknown>;
}

// Convert camelCase keys to snake_case for Supabase
function toSnakeCaseKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// SELECT query
export async function select<T>(options: QueryOptions): Promise<T[]> {
  let query = supabase.from(options.table).select(options.select || '*');

  // WHERE conditions
  if (options.where) {
    for (const [column, value] of Object.entries(options.where)) {
      query = query.eq(column, value);
    }
  }

  // WHERE IN
  if (options.whereIn) {
    query = query.in(options.whereIn.column, options.whereIn.values);
  }

  // ORDER
  if (options.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? false,
    });
  }

  // LIMIT
  if (options.limit) {
    query = query.limit(options.limit);
  }

  // OFFSET
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase select error on ${options.table}:`, error);
    throw error;
  }

  return (data as T[]) || [];
}

// SELECT single row
export async function selectOne<T>(options: QueryOptions): Promise<T | null> {
  const results = await select<T>({ ...options, limit: 1 });
  return results[0] || null;
}

// INSERT query
export async function insert<T>(options: InsertOptions): Promise<T | null> {
  const data = Array.isArray(options.data)
    ? options.data.map((item) => toSnakeCaseKeys(item))
    : toSnakeCaseKeys(options.data);

  if (options.returning !== false) {
    const { data: result, error } = await supabase
      .from(options.table)
      .insert(data as never)
      .select()
      .single();

    if (error) {
      console.error(`Supabase insert error on ${options.table}:`, error);
      throw error;
    }
    return result as T;
  } else {
    const { error } = await supabase.from(options.table).insert(data as never);
    if (error) {
      console.error(`Supabase insert error on ${options.table}:`, error);
      throw error;
    }
    return null;
  }
}

// UPDATE query
export async function update<T>(options: UpdateOptions): Promise<T | null> {
  const data = toSnakeCaseKeys(options.data);

  if (options.returning !== false) {
    let query = supabase.from(options.table).update(data as never);

    // Apply WHERE conditions
    for (const [column, value] of Object.entries(options.where)) {
      query = query.eq(column, value);
    }

    const { data: result, error } = await query.select().single();

    if (error) {
      console.error(`Supabase update error on ${options.table}:`, error);
      throw error;
    }
    return result as T;
  } else {
    let query = supabase.from(options.table).update(data as never);

    for (const [column, value] of Object.entries(options.where)) {
      query = query.eq(column, value);
    }

    const { error } = await query;
    if (error) {
      console.error(`Supabase update error on ${options.table}:`, error);
      throw error;
    }
    return null;
  }
}

// DELETE query
export async function remove(options: DeleteOptions): Promise<boolean> {
  let query = supabase.from(options.table).delete();

  for (const [column, value] of Object.entries(options.where)) {
    query = query.eq(column, value);
  }

  const { error } = await query;

  if (error) {
    console.error(`Supabase delete error on ${options.table}:`, error);
    throw error;
  }

  return true;
}

// Count rows
export async function count(table: string, where?: Record<string, unknown>): Promise<number> {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });

  if (where) {
    for (const [column, value] of Object.entries(where)) {
      query = query.eq(column, value);
    }
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Supabase count error on ${table}:`, error);
    throw error;
  }

  return count || 0;
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}
