

import { FastifyInstance, FastifyReply } from "fastify";
import { readFile } from "fs/promises";
import { paths } from "../../config";
import { pathExtname, pathJoin, tryCatchPromise } from "../../utils";




interface DataRequest {
  Params: {
    dir: string;
    dir2: string;
  }
}




const dataDir = pathJoin(paths.web, '_data');



export function useDataRoutes(amount: number, f: FastifyInstance, rootURL: string) {
  for (let i = amount; i > 0; i--) {
    f.get<DataRequest>(`${rootURL}/data${createRouteParams(i)}`, async (req, res) => {
      return await getPageData(req.params, res);
    });
  }
}

function createRouteParams(amount: number) {
  let paramPath = '';
  for (let i = 0; i < amount; i++) {
    paramPath += `/:p${i}`;
  }
  return paramPath;
}


async function getPageData(params: object, res: FastifyReply) {
  const path = getFilePathFromParams(params);

  if (pathExtname(path) == '.json') {
    res.header('Content-Type', 'application/json; charset=utf-8');
    return await tryReadFile(pathJoin(dataDir, path), res);
  }

  if (pathExtname(path) == '.mdhtml') {
    res.header('Content-Type', 'text/html; charset=utf-8');
    return await tryReadFile(pathJoin(dataDir, path), res);
  }

  return res.badRequest('Unsupported Request');
}


function getFilePathFromParams(params: object) {
  const segments  = Object.values(params);
  const lastSeg   = segments.pop();
  const segLength = segments.length - 1;

  let uri =
    lastSeg.includes('.')
      ? lastSeg
      : `${lastSeg}/${lastSeg}.json`
  ;

  for (let i = segLength; i > -1; i--) {
    const seg = segments[i];
    uri = `${seg}/${uri}`;
  }

  return uri;
}


async function tryReadFile(path: string, res: FastifyReply) {
  const fileResp = await tryCatchPromise(readFile(path, { encoding: 'utf-8' }));

  if (fileResp instanceof Error) {
    if (fileResp.message.includes('ENOENT')) {
      return res.notFound();
    }
    return res.internalServerError(fileResp.message);
  }

  return fileResp;
}




