
import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import useAuthSetupRoute from './api-auth-setup';
import { useAPIAuthHook } from '../../hooks/api-auth-hook';
import useAuthRed33mRoute from './api-auth-red33m';





const apiOptions: RouteShorthandOptions = {
  schema: {
    response: {
      403: Type.String()
    },
  }
};


const api: FastifyPluginAsync = async (fastify) => {
  useAPIAuthHook(fastify);
  useAuthSetupRoute(fastify, '/api');
  useAuthRed33mRoute(fastify, '/api');

  fastify.get('/api', apiOptions, (req, res) => {
    res.status(403);
    res.send('Forbidden');
  });

  fastify.get('/api/*', apiOptions, (req, res) => {
    res.log.info('root level denial');
    res.status(403);
    res.send('Forbidden');
  });
};

export default api;