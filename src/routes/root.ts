import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify';
import { paths } from '../config';
import { defaultResponseSchema } from '../schemas/std-schemas';
import { pathExtname } from '../utils';





const rootPath = paths.client;

const rootSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema,
    },
  }
};




const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/*', rootSchema, function (req, res) {

    if (pathExtname(req.url)) {
      res.header('cache-control', 'max-age=31536000');
      return void res.sendFile(req.url, rootPath);
    }

    // Always send index (SPA-compatibility)
    return void res.sendFile('/index.html', rootPath);
  });
};

export default root;
