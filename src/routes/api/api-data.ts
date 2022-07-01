

import { FastifyInstance, FastifyReply } from "fastify";
import { paths } from "../../config";
import { pathExtname, pathJoin } from "../../utils";




interface DataRequest {
  Params: {
    dir: string;
    dir2: string;
  }
}




const dataDir = pathJoin(paths().web, '_data');



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
    return res.sendFile(path, dataDir);
  }

  if (pathExtname(path) == '.mdhtml') {
    res.header('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(path, dataDir);
  }

  return res.unsupportedMediaType('Unsupported Request');
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




