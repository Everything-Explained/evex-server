

import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { ServerConfig } from './types/private-config';
import { isDev } from './utils';


const config: ServerConfig = JSON.parse(
  readFileSync(`${pathResolve('./config.json')}`, { encoding: 'utf-8'})
);

const inDev = isDev();

export const serverConfig = (() => {
  const clonedConfig = { mail: { ...config.mail }, auth: { ...config.auth }, allowedDevOrigins: config.allowedDevOrigins  };
  clonedConfig.mail.toEthan = inDev && 'fake@test.yee' || config.mail.toEthan;
  clonedConfig.auth.red33m  = inDev && config.auth.testCode || config.auth.red33m;
  return clonedConfig;
})();

export const paths = (() => {
  const client = inDev
    ? pathResolve('../web-client/dist')
    : pathResolve('../client');

  const data = inDev
    ? pathResolve('../evex-staging/client')
    : pathResolve('../client');

  return { client, data, subDomain: pathResolve('../') };
})();








