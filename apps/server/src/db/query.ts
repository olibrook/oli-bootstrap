import { type PgSelect, type PgTable } from 'drizzle-orm/pg-core';
import { notFound } from '../errors';
import { type Database } from './index';
import { and, eq, getTableColumns, type SQL, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { AuthJSUser, Org, OrgMembership } from './schema';

/**
 * Unpack the first element from a Drizzle response, since it doesn't
 * have an equivalent to Django's queryset.get().
 */
export function firstOrNotFound<T>(arr: T[]): T {
  if (arr.length !== 1 || arr[0] == undefined) {
    throw notFound();
  } else {
    return arr[0];
  }
}

/**
 * Paginate a query, usage:
 *
 *       const query = db
 *        .select()
 *        .from(PlayerSessionsView)
 *        .where(eq(PlayerSessionsView.orgId, org.id));
 *
 *      return await paginate(db, query.$dynamic(), page, pageSize);
 *
 * Note $dynamic()!
 */
export async function paginate<T extends PgSelect>(
  db: Database,
  baseQuery: T,
  page: number,
  pageSize: number
): Promise<{
  results: Awaited<T>;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}> {
  const offset = (page - 1) * pageSize;

  const [totalCountResult, results] = await Promise.all([
    db
      .select({ totalCount: sql<number>`CAST(COUNT(*) AS REAL)` })
      .from(baseQuery.as('sub'))
      .then(firstOrNotFound),
    baseQuery.limit(pageSize).offset(offset),
  ]);

  const { totalCount } = totalCountResult;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page * pageSize < totalCount;

  return {
    results,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasMore,
  };
}

export const checkUserAndOrg = async ({ db, userId, orgId }: { db: Database; userId?: string; orgId?: string }) => {
  const notAMember = () => new TRPCError({ code: 'UNAUTHORIZED', cause: 'NOT_A_MEMBER' });

  if (!userId || !orgId) {
    throw notAMember();
  }

  const [users, orgs, memberships] = await Promise.all([
    db.select().from(AuthJSUser).where(eq(AuthJSUser.id, userId)),
    db.select().from(Org).where(eq(Org.id, orgId)),
    db
      .select()
      .from(OrgMembership)
      .where(and(eq(OrgMembership.userId, userId), eq(OrgMembership.orgId, orgId)))
      .limit(1),
  ]);

  const [user] = users;
  const [org] = orgs;
  const [membership] = memberships;

  if (user && org) {
    if (membership || user.isSuperUser) {
      return { user, org };
    }
  }

  throw notAMember();
};

/**
 * Generate a `set: {}` clause for a Drizzle UPSERT statement that updates
 * all fields on the table except for those specified in args to this function.
 *
 * Eg:
 *
 *     await db
 *      .insert(users)
 *      .values(batch)
 *      .onConflictDoUpdate({
 *        target: [
 *          users.id,
 *        ],
 *        set: conflictUpdateAllExcept(users, [
 *          "id",
 *        ]),
 *      });
 */
export function conflictUpdateAllExcept<T extends PgTable, E extends (keyof T['$inferInsert'])[]>(table: T, except: E) {
  const columns = getTableColumns(table);
  const updateColumns = Object.entries(columns).filter(([col]) => !except.includes(col as keyof typeof table.$inferInsert));
  return updateColumns.reduce(
    (acc, [colName, table]) => ({
      ...acc,
      [colName]: sql.raw(`excluded.${table.name}`),
    }),
    {}
  ) as Omit<Record<keyof typeof table.$inferInsert, SQL>, E[number]>;
}
