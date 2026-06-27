/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { createServer } from 'node:http';

import express from 'express';
import cors from 'cors';

import { getCorsOrigins } from './core/config.js';
import { fileSizeLimitMiddleware } from './middleware/file_size.js';
import { startupTasks } from './core/startup.js';
import { attachWebSocketServer } from './core/websocket_server.js';
import { HttpError } from './core/errors.js';

import { authRouter } from './routes/auth.js';
import { systemRouter } from './routes/system.js';
import { membersRouter } from './routes/members.js';
import { frontingRouter } from './routes/fronting.js';
import { usersRouter } from './routes/users.js';
import { metricsRouter } from './routes/metrics.js';
import { adminRouter } from './routes/admin.js';
import { memberStatusRouter } from './routes/member_status.js';
import { botRouter } from './routes/bot.js';
import { batteryRouter } from './routes/battery.js';
import { helperRouter } from './routes/helper.js';
import { systemDataRouter } from './routes/system_data.js';
import { staticRouter } from './routes/static.js';

const PORT = Number(process.env.PORT ?? 5000);

async function main(): Promise<void> {
  const app = express();

  // Trust the first hop proxy (nginx) so req.ip reflects the real client,
  // not nginx's address. Tighten this to nginx's specific address/subnet
  // if it's not running on the same host as this container.
  app.set('trust proxy', 1);

  // ==========================================================================
  // MIDDLEWARE
  // ==========================================================================

  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // allowedHeaders intentionally omitted — see comment above. `cors`
      // reflects the request's Access-Control-Request-Headers back,
      // which is the credentials-safe equivalent of "allow everything".
    }),
  );

  app.use(fileSizeLimitMiddleware);

  // Body parsing. Most routes expect JSON; the legacy /api/login form path
  // additionally layers multer().none() on just that route (see auth.ts).
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================================================
  // STARTUP TASKS
  // ==========================================================================

  await startupTasks();

  // ==========================================================================
  // ROUTERS
  // Mounting order/prefixes mirror main.py's include_router() calls exactly.
  // ==========================================================================

  app.use(authRouter); // No prefix (paths are absolute, e.g. /api/login)
  app.use('/api', systemRouter);
  app.use('/api', membersRouter);
  app.use('/api', frontingRouter);
  app.use('/api', usersRouter);
  app.use('/api', metricsRouter);
  app.use('/api', adminRouter);
  app.use('/api', memberStatusRouter);
  app.use(botRouter); // No prefix (paths are absolute, e.g. /api/bot/...)
  app.use(batteryRouter); // No prefix (paths are absolute, e.g. /api/battery)
  app.use('/api', helperRouter); // Visitor logging — must be before static catch-all

  // Visitor log relay/browser UI. Not part of the original main.py (it was
  // a separate standalone service) — mounted here per request, gated
  // behind requireAuth + requireAdmin inside system_data.ts itself.
  app.use('/system-data', systemDataRouter);

  app.use(staticRouter); // Must be last — "/:member_name" is a catch-all

  // ==========================================================================
  // ERROR HANDLING
  // Equivalent to FastAPI's automatic HTTPException -> JSON response
  // translation. Must be registered after all routers.
  // ==========================================================================

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof HttpError) {
      if (err.headers) {
        res.set(err.headers);
      }
      res.status(err.statusCode).json({ detail: err.message });
      return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({ detail: 'Internal server error' });
  });

  // ==========================================================================
  // HTTP + WEBSOCKET SERVER
  // ==========================================================================

  const httpServer = createServer(app);
  attachWebSocketServer(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.info(`Doughmination System API listening on 0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});