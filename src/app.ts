import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import api from './routes/api/api';
import fastifyStatic from '@fastify/static';
import { inDev, paths } from './config';
import { pathJoin } from './utils';
import root from './routes/root';
import cors from '@fastify/cors';

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
    root: paths().web,
    serve: false,
  });

  void fastify.register(fastifyStatic, {
    root: pathJoin(paths().web, '_data'),
    allowedPath: (pathName, root) => {
      return !!root?.includes('_data');
    },
    decorateReply: false,
    index: false,
    serve: false,
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });

  if (inDev) {
    void fastify.register(cors, {
      origin: 'http://127.0.0.1:3000',
    });
  }
  void fastify.register(api, opts);
  void fastify.register(root, opts);

};

export default app;
export { app };
