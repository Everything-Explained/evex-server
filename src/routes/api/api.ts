
import { FastifyPluginAsync } from 'fastify';
import useAuthSetupRoute from './api-auth-setup';
import { useAPIAuthHook } from '../../hooks/api-auth-hook';
import useAuthRed33mRoute from './api-auth-red33m';





const api: FastifyPluginAsync = async (fastify) => {
  useAPIAuthHook(fastify);
  useAuthSetupRoute(fastify, '/api');
  useAuthRed33mRoute(fastify, '/api');

  fastify.get('/api*', (req, res) => {
    return res.forbidden('Suspicious Activity Detected');
  });
};

export default api;