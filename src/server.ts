import { httpsCredentials } from './ssl/ssl';
import { isProduction, pathJoin } from './utils';
import build from './app2';
import { FastifyBaseLogger, FastifyLoggerOptions } from 'fastify';
import * as http from 'http';
import { PinoLoggerOptions } from 'fastify/types/logger';

type Logger = FastifyLoggerOptions<http.Server> & PinoLoggerOptions | FastifyBaseLogger | boolean;

const server = build({
  http2: true,
  https: {
    allowHTTP1: true,
    ...httpsCredentials,
  },
  logger: setLogger(),
  trustProxy: true,
  requestTimeout: 120000,
  connectionTimeout: 5000,
});

server.listen({ port: isProduction() ? 443 : 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});

function setLogger(): Logger {
  if (isProduction()) {
    return {
      level: 'info',
      file: `${pathJoin(process.cwd())}/logs/${(new Date()).toISOString().split('.')[0].replaceAll(':', '-')}.txt`
    };
  }
  return {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  };
}