import fastifyStatic from "@fastify/static";
import { FastifyInstance } from "fastify";
import { paths } from "../config";
import { pathResolve } from "../utils";


type SubDomain = {
  name  : string;
  cache : boolean;
  path  : string;
}

type SubDomainOptions = Omit<SubDomain, "path">[]

const subDomainRoot = paths().subDomain;


export const useSubDomainHook = (f: FastifyInstance, domainOpts: SubDomainOptions) => {

  const subDomains: SubDomain[] = domainOpts.map(d => (
    {...d, path: pathResolve(`${subDomainRoot}/web-sub-${d.name}`)
  }));

  subDomains.forEach(d => {
    void f.register(fastifyStatic, {
      root: d.path,
      serve: false,
      decorateReply: false,
    });
  });

  f.addHook('onRequest', (req, res, done) => {
    const domain = subDomains.find(d => req.hostname.indexOf(`${d.name}.`) == 0);

    if (!domain) {
      return done();
    }

    // Allow web-frameworks to bust cache manually
    // therefore do not cache this route.
    if (req.url == '/') {
      res.sendFile('/src/index.html', domain.path);
      return;
    }

    if (domain.cache) {
      res.header('cache-control', 'max-age=31536000');
    }
    res.sendFile(`/src/${req.url}`, domain.path);
  });
};








