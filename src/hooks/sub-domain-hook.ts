import fastifyStatic from "@fastify/static";
import { FastifyInstance } from "fastify";


type SubDomain = {
  name      : string;
  cache     : boolean;
  /** Fully qualified path */
  filesPath : string;
}



export const useSubDomainHook = (f: FastifyInstance, subs: SubDomain[]) => {

  subs.forEach(s => {
    void f.register(fastifyStatic, {
      root: s.filesPath,
      serve: false,
      decorateReply: false,
    });
  });

  f.addHook('onRequest', (req, res, done) => {
    const domain = subs.find(d => req.hostname.indexOf(`${d.name}.`) == 0);

    if (!domain) {
      return done();
    }

    // Allow web-frameworks to bust cache manually
    // therefore do not cache this route.
    if (req.url == '/') {
      res.sendFile('/index.html', domain.filesPath);
      return;
    }

    if (domain.cache) {
      res.header('cache-control', 'max-age=31536000');
    }
    res.sendFile(`/${req.url}`, domain.filesPath);
  });
};








