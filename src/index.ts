/* eslint no-console: ["warn", { allow: ["log", "error"] }] */
import * as Sentry from '@sentry/node';
import app from './app';

const port = process.env.PORT || 3000;
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection', p, reason);
  throw reason;
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception', error);
  Sentry.captureException(error);
  Sentry.flush().then(() => process.exit(1));
});

server.on('listening', () => console.log(`> listening on port ${port}`));
