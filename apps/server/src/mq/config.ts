import { env } from '@oliBootstrap/server/env';

export const connection = { url: env.REDIS_URL };
