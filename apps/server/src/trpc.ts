import { initTRPC, TRPCError, type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';

import type { AppRouter } from '@oliBootstrap/server/router';
import { db } from './db';
import { checkUserAndOrg } from './db/query';
import { getSession } from './auth';
import { type Request } from 'express';

export const createTRPCContext = async ({ req }: { req: Request }) => {
  const session = await getSession(req);
  return {
    db,
    session,
  };
};

const trpc = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = trpc.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (trpc._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = trpc.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: 'REQUIRES_LOGIN' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Authenticated + authorized procedure.
 *
 * Use this to guarantee that the user is authenticated *and also* a member of the org specified
 * by ID in the input.
 *
 * @see https://trpc.io/docs/procedures
 */
export const orgMemberProcedure = protectedProcedure.input(z.object({ orgId: z.string() })).use(async ({ input, ctx, next }) => {
  const { orgId } = input;
  const userId = ctx.session.user.id;
  const { db } = ctx;
  const { org } = await checkUserAndOrg({ db, userId, orgId });
  return next({
    input,
    ctx: {
      ...ctx,
      org,
    },
  });
});

export const router = trpc.router;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
