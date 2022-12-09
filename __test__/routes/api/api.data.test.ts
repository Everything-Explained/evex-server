

import { describe } from 'riteway';
import { constAuthedHeader, r3dAuthHeader } from '../../test.fastify';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';
import * as fs from 'fs-ext';
import { openSync } from 'fs';
import { paths } from '../../../src/config';
import { pathJoin } from '../../../src/utils';
import build from '../../../src/app2';



type StringPayload = {
  statusCode: number;
  payload: {
    hello: string;
  }
}

type BadReqPayload = {
  statusCode: number;
  payload: BadRequestSchema
}



const url = '/api/data';
const mockURL = '/_data/__mock__';


describe(`GET ${url}`, async t => {
  const app = await build();

  const testNoParams = await testParams(url);
  t({
    given: '/data',
    should: 'send 403 status',
    actual: testNoParams.statusCode,
    expected: 403
  });

  t({
    given: '/data/mock.json',
    should: 'send mock.json',
    actual: (await testParams(`${url}/mock.json`)).payload.hello,
    expected: 'singleParamWithExt'
  });

  t({
    given: `${mockURL}`,
    should: 'send ../__mock__/__mock__.json',
    actual: (await testParams(`${url}/__mock__`)).payload.hello,
    expected: 'singleParamNoExt'
  });

  t({
    given: `${mockURL}/file.json`,
    should: 'send file.json',
    actual: (await testParams(`${url}/__mock__/file.json`)).payload.hello,
    expected: 'doubleParamWithExt'
  });

  t({
    given: `${mockURL}/mock`,
    should: 'send ../mock/mock.json',
    actual: (await testParams(`${url}/__mock__/mock`)).payload.hello,
    expected: 'doubleParamNoExt'
  });

  t({
    given: `${mockURL}/mdhtmlFile.mdhtml`,
    should: `send mdhtmlFile.mdhtml`,
    actual: (await testParams(`${url}/__mock__/mdhtmlFile.mdhtml`)).payload.hello,
    expected: 'mdhtmlFile'
  });

  t({
    given: `${mockURL}/mock/file.json`,
    should: 'send ../mock/file.json',
    actual: (await testParams(`${url}/__mock__/mock/file.json`)).payload.hello,
    expected: 'tripleParamWithExt'
  });

  t({
    given: '/data/file.nonSupportedExt',
    should: 'send 415 status',
    actual: (await testParams(`${url}/__mock__/test.html`, 'obj')).payload.statusCode,
    expected: 415
  });

  t({
    given: '/data/file.nonSupportedExt',
    should: 'send custom message',
    actual: (await testParams(`${url}/__mock__/test.html`, 'obj')).payload.message,
    expected: 'Unsupported Request'
  });

  t({
    given: '/data/fileNotExist.json',
    should: 'send 404 status',
    actual: (await testParams(`${url}/fileNotExist.json`)).statusCode,
    expected: 404
  });

  const webPath = pathJoin(paths.data, mockURL, 'fileError.json');
  console.log(webPath);
  const fd = openSync(webPath, 'r');
  fs.flockSync(fd, 'ex');
  t({
    given: `${mockURL}/fileError.json`,
    should: 'send 500 status',
    actual: (await testParams(`${url}/__mock__/fileError.json`)).statusCode,
    expected: 500
  });
  t({
    given: `${mockURL}/fileError.json`,
    should: 'send error message',
    actual: (await testParams(`${url}/__mock__/fileError.json`, 'obj')).payload.message,
    expected: 'EBUSY: resource busy or locked, read'
  });

  t({
    given: '/red33m & no red33m code',
    should: 'send 403 status',
    actual: (await testParams(`${url}/literature/red33m`, 'obj')).payload.statusCode,
    expected: 403
  });
  t({
    given: "/red33m & no red33m code",
    should: 'send custom message',
    actual: (await testParams(`${url}/literature/red33m`, 'obj')).payload.message,
    expected: 'Suspicious Activity Detected'
  });

  t({
    given: '/red33m & has red33m code',
    should: 'send 200 status',
    actual: (await testParams(`${url}/literature/red33m`, 'obj', r3dAuthHeader)).statusCode,
    expected: 200
  });

  // Cleanup everything here
  app.close();



  async function testParams(url: string): Promise<StringPayload>
  async function testParams(url: string, payloadType: 'obj'): Promise<BadReqPayload>
  async function testParams(url: string, payloadType: 'obj', headers: typeof constAuthedHeader): Promise<StringPayload>
  async function testParams(url: string, payloadType?: 'obj', headers = constAuthedHeader) {
    const { payload, statusCode } = await app.inject({ url, headers });
    return {
      statusCode,
      payload: payloadType == 'obj' && JSON.parse(payload) as BadRequestSchema || JSON.parse(payload) as { hello: string }
    };
  }

});








