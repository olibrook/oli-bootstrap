import { router } from '@oliBootstrap/server/trpc';
import { statusCheckRouter } from '@oliBootstrap/server/router/status-check';
import { userRouter } from '@oliBootstrap/server/router/users';

export const appRouter = router({
  statusCheck: statusCheckRouter,
  users: userRouter,
});

export type AppRouter = typeof appRouter;
