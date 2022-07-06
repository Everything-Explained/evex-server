

import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { ServerConfig } from './types/private-config';


export const inDev = process.env.NODE_ENV == 'development';

const config: ServerConfig = JSON.parse(
  readFileSync(`${pathResolve('./config.json')}`, { encoding: 'utf-8'})
);

export const serverConfig = (env: 'production'|'development' = process.env.NODE_ENV) => {
  const inDev = env == 'development';
  const clonedConfig = { mail: { ...config.mail }, auth: { ...config.auth }  };
  clonedConfig.mail.toEthan = inDev && 'fake@test.yee' || config.mail.toEthan;
  clonedConfig.auth.red33m  = inDev && config.auth.testCode || config.auth.red33m;
  return clonedConfig;
};

export const paths = (env: 'production'|'development' = process.env.NODE_ENV) => ({
  client: env == 'development'
        ? pathResolve('../web-client/dist')
        : pathResolve('../web_client'),
  data: env == 'development'
    ? pathResolve('../web-client/release/web_client')
    : pathResolve('../web_client')
});








