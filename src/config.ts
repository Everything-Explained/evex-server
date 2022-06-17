

import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { ServerConfig } from './types/private-config';


export const inDev = process.env.NODE_ENV == 'development';

export const serverConfig: ServerConfig =
  JSON.parse(
    readFileSync(`${pathResolve('./config.json')}`, { encoding: 'utf-8'})
  )
;

export const paths = {
  web: inDev
        ? pathResolve('../web-client/release/web_client')
        : pathResolve('../web_client')
};








