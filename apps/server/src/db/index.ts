import { env } from '../env';
import { drizzle } from 'drizzle-orm/node-postgres';
import type * as schema from './schema';

export const db = drizzle<typeof schema>(env.DATABASE_URL);
export type Database = typeof db;
