
import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify';
import useAuthSetupRoute from './api-auth-setup';
import { useAPIAuthHook } from '../../hooks/api-auth-hook';
import useAuthRed33mRoute from './api-auth-red33m';
import { useDataRoutes } from './api-data';
import { useFormQnA } from './api-form-qna';
import { defaultResponseSchema } from '../../schemas/std-schemas';



const apiSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema,
    }
  }
};



const api: FastifyPluginAsync = async (fastify) => {
  const routeRoot = '/api';
  useAPIAuthHook(fastify);
  useAuthSetupRoute(fastify, routeRoot);
  useAuthRed33mRoute(fastify, routeRoot);
  useDataRoutes(3, fastify, routeRoot);
  useFormQnA(fastify, routeRoot);

  fastify.all(`${routeRoot}*`, apiSchema, (req, res) => {
    return res.forbidden('Suspicious Activity Detected');
  });
};

export default api;