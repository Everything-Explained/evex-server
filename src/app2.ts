import fastifyStatic = require('@fastify/static');
import Fastify, { fastify } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { join } from 'path';
import { paths, serverConfig } from './config';
import { httpsCredentials } from './ssl/ssl';
import { isDev, isProduction, isStaging, pathJoin } from './utils';
import cors = require('@fastify/cors');
import api from './routes/api/api';
import root from './routes/root';

const _fastify = Fastify({
  http2: true,
  https: {
    allowHTTP1: true,
    ...httpsCredentials,
  },
  trustProxy: true,
  logger: {
    level: 'trace',
    file: `${pathJoin(process.cwd())}/logs/${(new Date()).toISOString().split('.')[0].replaceAll(':', '-')}.txt`,
  },
  requestTimeout: 120000,
  connectionTimeout: 5000,
});

_fastify.register(fastifyStatic, {
  root: paths.client,
  serve: false,
});

_fastify.register(fastifyStatic, {
  root: pathJoin(paths.data, '_data'),
  decorateReply: false,
  index: false,
  serve: false,
});

_fastify.register(AutoLoad, {
  dir: join(__dirname, 'plugins'),
  options: {}
});

if (isDev() || isStaging()) {
    _fastify.register(cors, {
      origin: serverConfig.allowedDevOrigins,
    });
}

if (isProduction() && !isStaging()) {
  _fastify.addHook('onRequest', (req, rep, done) => {
    if (req.headers[serverConfig.securityHeader] == 'cloudflare') done();
    else {
      _fastify.log.info('Missing Security Header');
      rep.status(403).send();
    }
  });
}

_fastify.register(api);
_fastify.register(root);

_fastify.listen({ port: isProduction() ? 443 : 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    _fastify.log.error(err);
    process.exit(1);
  }
});