import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express, { type Express } from 'express';
import { appRouter } from '@oliBootstrap/server/router';
import { env } from './env';
import { createServer } from 'http';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { authMiddleware } from './auth';
import { createTRPCContext } from './trpc';
import { type Request } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// @ts-expect-error: Module option doesn't support import.meta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(path.join(__dirname, '..', '..', '..'));
const WEB_DIST = path.join(REPO_ROOT, 'apps', 'web', 'dist');

const addStaticHandlers = (app: Express) => {
  // Static assets - explicitly define which paths should be treated as static
  app.use('/assets', express.static(path.join(WEB_DIST, 'assets')));
  app.use('/favicon.png', express.static(path.join(WEB_DIST, 'favicon.png')));

  // Catch-all route for SPA - handle any other request by serving index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
};

export async function main() {
  const port = env.PORT;

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(cors());

  // HTTP tRPC middleware
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: (ctx) => createTRPCContext({ req: ctx.req }),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
              console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
            }
          : () => {},
    })
  );

  // WebSocket tRPC middleware
  applyWSSHandler({
    wss,
    router: appRouter,
    createContext: (ctx) => createTRPCContext({ req: ctx.req as Request }),
  });

  // AuthJS
  app.set('trust proxy', true);
  app.use('/api/auth/*', authMiddleware);

  // Anything else is a request for a static asset – ie. the web frontend
  // which is bundled in the Docker image.
  addStaticHandlers(app);

  server.listen(port, () => {
    console.log(`HTTP & WebSocket server listening on port: ${port}`);
  });
}
