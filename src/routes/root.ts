import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify';
import { paths } from '../config';
import { defaultResponseSchema, stdErrorSchema } from '../schemas/std-schemas';
import { pathExtname } from '../utils';





const rootPath = paths().client;

const rootSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema
    }
  }
};




const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/*', rootSchema, async function (req, res) {
    const isAsset =
         pathExtname(req.url) == '.js'
      || pathExtname(req.url) == '.css'
    ;
    if (isAsset) {
      res.header('cache-control', 'public, max-age=31536000');
      return res.sendFile(req.url, rootPath);
    }
    // Always send index (SPA-compatibility)
    return res.sendFile('/index.html', rootPath);
  });
};

export default root;
