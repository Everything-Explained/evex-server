import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import api from './routes/api/api';
import fastifyStatic from '@fastify/static';
import { paths } from './config';
import { pathJoin } from './utils';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {

  // Place here your custom code!
  void fastify.register(fastifyStatic, {
    root: pathJoin(paths().web, '_data'),
    allowedPath: (pathName, root) => {
      return !!root?.includes('_data');
    },
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

  // This loads all plugins defined in routes
  // void fastify.register(AutoLoad, {
  //   dir: join(__dirname, 'routes'),
  //   options: opts
  // });

  void fastify.register(api, opts);

};

export default app;
export { app };
