import { join, resolve, extname } from "path";




export const pathJoin = join;
export const pathResolve = resolve;
export const pathExtname = extname;


export async function tryCatchPromise<T>(p: Promise<T>): Promise<Error|T> {
  try {
    return await p;
  }
  catch (e) {
    return e as Error;
  }
}



