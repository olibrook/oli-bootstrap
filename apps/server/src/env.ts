import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const encodePasswordInUrl = (arg: unknown) => {
  if (typeof arg !== 'string') {
    return arg;
  }

  if (process.env.DATABASE_PASSWORD) {
    const url = new URL(arg);
    url.password = encodeURIComponent(process.env.DATABASE_PASSWORD);
    return url.toString();
  }

  return arg;
};

export const env = createEnv({
  server: {
    DATABASE_URL: z.preprocess(encodePasswordInUrl, z.string().url()),
    TEST_DATABASE_URL: z.string().url(),

    PORT: z.coerce.number().default(3001),

    // Auth.js
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.coerce.boolean().optional(),
    AUTH_SECRET: z.string(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_CLIENT_SIDE_VAR: z.string().min(1).default(' '),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
