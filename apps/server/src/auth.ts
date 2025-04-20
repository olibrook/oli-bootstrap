import { type DefaultSession, ExpressAuth, type ExpressAuthConfig, getSession as _getSession } from '@auth/express';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import * as schema from './db/schema';
import { type Request } from 'express';

declare module '@auth/express' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

const config: ExpressAuthConfig = {
  debug: true,
  providers: [
    // TODO: Add the simplest login backend
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: schema.AuthJSUser,
    accountsTable: schema.AuthJSAccount,
    sessionsTable: schema.AuthJSSession,
    verificationTokensTable: schema.AuthJSVerificationToken,
    authenticatorsTable: schema.AuthJSAuthenticator,
  }),
  callbacks: {
    session: async ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
};

export const authMiddleware = ExpressAuth(config);

export const getSession = (req: Request) => _getSession(req, config);
