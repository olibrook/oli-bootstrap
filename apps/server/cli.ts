#!/usr/bin/env -S pnpx tsx -r dotenv/config

import { $, execa } from 'execa';
import { Command, Option } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './src/db/schema';
import { firstOrNotFound } from './src/db/query';
import { v5 as uuidv5 } from 'uuid';
import pg from 'pg';

import readline from 'readline/promises';
import { type Database } from './src/db';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = path.resolve(path.join(__dirname, '..', '..'));

const uuidFrom = (inputString: string): string => {
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const uuid = uuidv5(inputString, NAMESPACE);
  return uuid;
};

const confirmOrExit = async (prompt: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirmation = await rl.question(`${prompt} (y/n): `);
  rl.close();

  if (confirmation.trim().toLowerCase() !== 'y') {
    console.error('Aborting.');
    process.exit(1);
  }
};

export function assertDefined<T>(
  value: T,
  message = 'Expected value to be defined, but received undefined or null.'
): asserts value is NonNullable<T> {
  if (value == null) {
    // null or undefined
    throw new Error(message);
  }
}

const getDB = (dbURL: string) => {
  const conn = new pg.Pool({ connectionString: dbURL });
  const db = drizzle(conn, { schema });
  return { conn, db };
};

const withDb = async (env: Env, f: (db: Database) => Promise<void>) => {
  const connectionString = await getDBConnectionString(env);
  const { db, conn } = getDB(connectionString);
  try {
    await f(db);
  } finally {
    conn.end();
  }
};

const checkDeps = async () => {
  const progs = ['docker', 'psql'];
  for (const prog of progs) {
    try {
      await $`which ${prog}`;
    } catch (e) {
      throw new Error(`This script depends on "${prog}", which isn't installed.`);
    }
  }
};

enum Env {
  Staging = 'staging',
  Production = 'production',
}

const envChoices = Object.values(Env);

const getDBConnectionString = async (env: Env): Promise<string> => {
  switch (env) {
    case Env.Production:
    case Env.Staging: {
      throw new Error('Not implemented');
    }
    case Env.Local: {
      return 'postgresql://postgres:postgres@localhost:5432/oliBootstrap';
    }
    case Env.Test: {
      return 'postgresql://postgres:postgres@localhost:5432/oliBootstraptest';
    }
  }
};

const program = new Command();

const OPTION_ENV = new Option('--env <env>', 'The environment to use').default('local').choices(envChoices);

program.name('cli');

program
  .command('drizzle-kit')
  .description('A wrapper around drizzle-kit')
  .addOption(OPTION_ENV)
  .allowUnknownOption() // Allow arg forwarding
  .allowExcessArguments()
  .helpOption(false) // Let Drizzle handle --help
  .action(async ({ env }: { env: Env }, program: Command) => {
    // Anything not captured by the args to the wrapper gets forwarded
    const args = program.args;

    const drizzleEnv = {
      ...process.env,
      DATABASE_URL: await getDBConnectionString(env),
    };

    await execa('drizzle-kit', args, {
      stdio: 'inherit',
      env: drizzleEnv,
      preferLocal: true,
    });
  });

program
  .command('db-url')
  .description('Print the DB URL')
  .addOption(OPTION_ENV)
  .action(async ({ env }: { env: Env }) => {
    const connectionString = await getDBConnectionString(env);
    console.log(connectionString);
  });

program
  .command('seed')
  .description('Seed the DB with data')
  .addOption(OPTION_ENV)
  .action(async ({ env: environment }: { env: Env }) => {
    await withDb(environment, async (db: Database) => {
      // Create any initial test data
      console.log(db);
    });
  });

program
  .command('make-superuser')
  .description('Give the user access to all orgs, etc.')
  .addOption(OPTION_ENV)
  .addOption(new Option('--id <id>', 'The user id'))
  .action(async ({ env, id }: { env: Env; id: string }) => {
    const connectionString = await getDBConnectionString(env);
    const { db, conn } = getDB(connectionString);

    const user = await db
      .update(schema.AuthJSUser)
      .set({ isSuperUser: true })
      .where(eq(schema.AuthJSUser.id, id))
      .returning()
      .then(firstOrNotFound);

    console.log('User updated:');
    console.log(JSON.stringify(user, null, 2));

    await conn.end();
  });

void Promise.resolve()
  .then(checkDeps)
  .then(() => program.parse(process.argv));
