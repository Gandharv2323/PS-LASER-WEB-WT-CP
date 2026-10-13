// GET /api/health - liveness + DB ping + a few `os`/`process` facts.
import os from 'node:os';
import { Router } from 'express';
import { pingDb } from '../db/pool.js';
import { asyncHandler } from '../utils/async-handler.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const db = await pingDb();
    res.json({
      ok: true, // the process is up and answering (CONTRACT shape: {ok, db})
      db,
      service: 'pslaser-node-api',
      node: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: Math.round(process.memoryUsage().rss / 1048576),
      os: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        freeMemMb: Math.round(os.freemem() / 1048576),
        totalMemMb: Math.round(os.totalmem() / 1048576),
        loadAvg: os.loadavg(), // always [0,0,0] on Windows
      },
      time: new Date().toISOString(),
    });
  }),
);
