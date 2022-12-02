import { join, resolve, extname } from "path";




export const pathJoin = join;
export const pathResolve = resolve;
export const pathExtname = extname;

export function isStaging() {
  return process.env.NODE_ENV == 'staging';
}

export function isDev() {
  return process.env.NODE_ENV == 'development';
}

export function isProduction() {
  return !isDev();
}


export async function tryCatchPromise<T>(p: Promise<T>): Promise<Error|T> {
  try {
    return await p;
  }
  catch (e) {
    return e as Error;
  }
}



