import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, RouteShorthandOptions } from 'fastify';
import { paths } from '../config';
import { defaultResponseSchema, stdErrorSchema } from '../schemas/std-schemas';
import { pathExtname } from '../utils';





const rootPath = paths().web;

const rootSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema
    }
  }
};




const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/*', rootSchema, async function (req, res) {
    const hasValidExt =
         pathExtname(req.url) == '.js'
      || pathExtname(req.url) == '.css'
    ;
    if (hasValidExt) {
      return res.sendFile(req.url, rootPath);
    }
    // Always send index (SPA-compatibility)
    return res.sendFile('/index.html', rootPath);
  });
};

export default root;
