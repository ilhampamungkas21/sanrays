// Supabase Database Exports
// Using Supabase (PostgreSQL) instead of MySQL

// Export supabase client and helpers from supabase.ts
export {
  supabase,
  createServerClient,
  checkConnection,
  generateId,
  toSnakeCase,
  toCamelCase,
  toCamelCaseArray,
} from './supabase';

// Export query helpers from query.ts
export {
  select,
  selectOne,
  insert,
  update,
  remove,
  count,
  generateId as generateUUID,
} from './query';
