// File-system logging with writable streams (fs.createWriteStream, append mode).
// One stream per log file stays open for the life of the process; closeLogs()
// flushes them during graceful shutdown.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';

fs.mkdirSync(config.paths.logs, { recursive: true });

const streams = new Map();

function streamFor(fileName) {
  if (!streams.has(fileName)) {
    const stream = fs.createWriteStream(path.join(config.paths.logs, fileName), { flags: 'a', encoding: 'utf8' });
    stream.on('error', (err) => console.error(`[log] cannot write ${fileName}:`, err.message));
    streams.set(fileName, stream);
  }
  return streams.get(fileName);
}

export const requestLogPath = () => path.join(config.paths.logs, config.requestLogFile);

export function writeLog(fileName, record) {
  streamFor(fileName).write(`${JSON.stringify({ time: new Date().toISOString(), ...record })}\n`);
}

export const logRequest = (record) => writeLog(config.requestLogFile, record);
export const logEvent = (record) => writeLog(config.eventLogFile, record);

export function closeLogs() {
  return Promise.all([...streams.values()].map((s) => new Promise((resolve) => s.end(resolve))));
}
