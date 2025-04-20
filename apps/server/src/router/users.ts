import { eq, sql } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';
import { unauthorized } from '../errors';
import { AuthJSUser, OrgMembership } from '../db/schema';
import { firstOrNotFound } from '../db/query';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const userId = ctx.session.user.id;
    if (!userId) {
      throw unauthorized();
    }

    const [user, numOrgMemberships] = await Promise.all([
      db.select().from(AuthJSUser).where(eq(AuthJSUser.id, userId)).then(firstOrNotFound),

      db
        .select({ count: sql<number>`count(*)` })
        .from(OrgMembership)
        .where(eq(OrgMembership.userId, userId))
        .then((rows) => rows[0]?.count ?? 0),
    ]);

    return { ...user, numOrgMemberships };
  }),
});
