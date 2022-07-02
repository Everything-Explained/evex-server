import { FastifyPluginAsync } from 'fastify'
import { paths } from '../config';
import { pathExtname } from '../utils';

const rootPath = paths().web;

const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/*', async function (req, res) {
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
