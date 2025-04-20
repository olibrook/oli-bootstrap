import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, text, timestamp, foreignKey, uniqueIndex, pgTable, boolean } from 'drizzle-orm/pg-core';

import type { AdapterAccountType } from '@auth/core/adapters';

// Tables named "AuthJS*" are required for AuthJS to work, handle with care.

export const AuthJSUser = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  isSuperUser: boolean('is_super_user').default(false),
});

export const AuthJSAccount = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => AuthJSUser.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (tbl) => [
    {
      compoundKey: primaryKey({
        columns: [tbl.provider, tbl.providerAccountId],
      }),
    },
  ]
);

export const AuthJSSession = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => AuthJSUser.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const AuthJSVerificationToken = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (tbl) => [
    {
      compositePk: primaryKey({
        columns: [tbl.identifier, tbl.token],
      }),
    },
  ]
);

export const AuthJSAuthenticator = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => AuthJSUser.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (tbl) => [
    {
      compositePK: primaryKey({
        columns: [tbl.userId, tbl.credentialID],
      }),
    },
  ]
);

export const Org = pgTable('org', {
  id: text('id')
    .notNull()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
});

export const OrgMembership = pgTable(
  'org_membership',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull(),
    orgId: text('org_id').notNull(),
    joinedAt: timestamp('joined_at', { precision: 3 }).notNull().defaultNow(),
  },
  (tbl) => [
    foreignKey({
      name: 'org_membership_user_fkey',
      columns: [tbl.userId],
      foreignColumns: [AuthJSUser.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('org_membership_user_idx').on(tbl.userId),
    foreignKey({
      name: 'org_membership_org_fkey',
      columns: [tbl.orgId],
      foreignColumns: [Org.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('org_membership_org_idx').on(tbl.orgId),
    uniqueIndex('org_membership__userId_orgId__unique__key').on(tbl.userId, tbl.orgId),
  ]
);
