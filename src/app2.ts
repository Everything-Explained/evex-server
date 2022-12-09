import { fastifyAutoload } from "@fastify/autoload";
import cors = require("@fastify/cors");
import fastifyStatic = require("@fastify/static");
import fastify, { FastifyBaseLogger, FastifyHttp2SecureOptions, FastifyServerOptions } from "fastify";
import { paths, serverConfig } from "./config";
import api from "./routes/api/api";
import root from "./routes/root";
import { isDev, isProduction, isStaging, pathJoin } from "./utils";
import * as http2 from 'http2';
import * as http from 'http';



type BuildOptions = FastifyServerOptions<http.Server, FastifyBaseLogger> | FastifyHttp2SecureOptions<http2.Http2SecureServer, FastifyBaseLogger>;
function build(opts?: BuildOptions) {
  const app = fastify(opts as any);
  app.register(fastifyStatic, {
    root: paths.client,
    serve: false,
  });

  app.register(fastifyStatic, {
    root: pathJoin(paths.data, '_data'),
    decorateReply: false,
    index: false,
    serve: false,
  });

  app.register(fastifyAutoload, {
    dir: pathJoin(__dirname, 'plugins'),
    options: {}
  });

  if (isDev() || isStaging()) {
      app.register(cors, {
        origin: serverConfig.allowedDevOrigins,
      });
  }

  if (isProduction() && !isStaging()) {
    app.addHook('onRequest', (req, rep, done) => {
      if (req.headers[serverConfig.securityHeader] == 'cloudflare') done();
      else {
        app.log.info('Missing Security Header');
        rep.status(403).send();
      }
    });
  }

  app.register(api);
  app.register(root);
  return app;
}

export default build;