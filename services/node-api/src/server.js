// Entry point: `npm start` -> node src/server.js
// Starts the Express app on PORT (4000) and shuts down gracefully.
import { createApp } from './app.js';
import { config } from './config/index.js';
import { closePool, pingDb } from './db/pool.js';
import { closeLogs } from './utils/file-logger.js';

const app = createApp();

const server = app.listen(config.port, async () => {
  const db = await pingDb();
  console.log(`PS Laser Enquiry API on http://localhost:${config.port}  (env=${config.env}, db=${db ? 'up' : 'DOWN'})`);
  console.log(`  docs:   http://localhost:${config.port}/`);
  console.log(`  health: http://localhost:${config.port}/api/health`);
});

server.on('error', (err) => {
  console.error(`Cannot listen on port ${config.port}:`, err.message);
  process.exit(1);
});

// Graceful shutdown: stop accepting connections, finish in-flight requests,
// close the MySQL pool and flush log streams, then exit.
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal} received - shutting down...`);
  const force = setTimeout(() => {
    console.error('Forced exit after 10 s');
    process.exit(1);
  }, 10_000);
  force.unref();

  server.close(async () => {
    await closePool().catch(() => {});
    await closeLogs();
    console.log('Server and DB pool closed. Bye.');
    process.exit(0);
  });
  server.closeIdleConnections(); // keep-alive sockets would otherwise delay close()
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
