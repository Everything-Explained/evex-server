import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import api from './routes/api/api';
import fastifyStatic from '@fastify/static';
import { paths, serverConfig } from './config';
import { isDev, isProduction, isStaging, pathJoin } from './utils';
import root from './routes/root';
import cors from '@fastify/cors';
import { httpsCredentials } from './ssl/ssl';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // All registered static URLs must follow
  // a specific registration path
  // /root
  // /root/nextRoot
  // /root/nextRoot/anotherRoot

  void fastify.register(fastifyStatic, {
    root: paths.client,
    serve: false,
  });

  void fastify.register(fastifyStatic, {
    root: pathJoin(paths.data, '_data'),
    decorateReply: false,
    index: false,
    serve: false,
  });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });

  if (isDev() || isStaging()) {
    void fastify.register(cors, {
      origin: serverConfig.allowedDevOrigins,
    });
  }
  if (isProduction()) {
    fastify.addHook('onRequest', (req, rep, done) => {
      if (req.headers[serverConfig.securityHeader] == 'cloudflare') done();
      else rep.status(403).send();
    });
  }
  // void useSubDomainHook(fastify, [
  //   {
  //     name: 'meet',
  //     cache: false,
  //     filesPath: pathJoin(paths().subDomain, 'web-sub-meet', 'src')
  //   },
  // ]);
  void fastify.register(api);
  void fastify.register(root);

};

export default app;
export const options = {
  http2: true,
  https: {
    ...httpsCredentials,
  },
  logger: {
    level: 'info',
    file: `${pathJoin(process.cwd())}/logs/${(new Date()).toISOString().split('.')[0].replaceAll(':', '-')}.txt`
  }
};
export { app };
