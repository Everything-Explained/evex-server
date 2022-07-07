import { readFileSync } from 'fs';
import { pathResolve } from '../utils';

export const httpsCredentials = {
  key: readFileSync(pathResolve(`${__dirname}/private.key`)).toString('utf-8'),
  cert: readFileSync(pathResolve(`${__dirname}/public.pem`)).toString('utf-8')
};