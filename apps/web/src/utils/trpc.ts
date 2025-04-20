import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@oliBootstrap/server';

type TRPCReactClient = ReturnType<typeof createTRPCReact<AppRouter>>;
export const trpc: TRPCReactClient = createTRPCReact<AppRouter>();
