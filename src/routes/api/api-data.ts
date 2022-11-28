

import { FastifyInstance, FastifyReply, RouteShorthandOptions } from "fastify";
import { paths } from "../../config";
import { APIRequest } from "../../hooks/api-auth-hook";
import { defaultResponseSchema } from "../../schemas/std-schemas";
import { pathExtname, pathJoin } from "../../utils";




type DataRequest = APIRequest & {
  Params: {
    dir: string;
    dir2: string;
  }
}




const dataDir = pathJoin(paths.data, '_data');
const dataSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema,
    }
  }
};



export function useDataRoutes(amount: number, f: FastifyInstance, rootURL: string) {
  for (let i = amount; i > 0; i--) {
    f.get<DataRequest>(`${rootURL}/data${createRouteParams(i)}`, dataSchema, async (req, res) => {
      if (req.url.includes('/red33m')) {
        if (!req.body.isRed33med) {
          return res.forbidden('Suspicious Activity Detected');
        }
      }
      res.header('cache-control', 'max-age=31536000');
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


/**
 * Converts paths like /url/to/data => /url/to/data/data.json
 * @param params URL Params
 * @returns modified URL
 */
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




