

import { describe } from 'riteway';
import { build, constAuthedHeader } from '../../test.fastify';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';
import * as fs from 'fs-ext';
import { openSync } from 'fs';
import { paths } from '../../../src/config';
import { pathJoin } from '../../../src/utils';



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

  const webPath = pathJoin(paths().web, mockURL, 'fileError.json');
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

  // Cleanup everything here
  app.close();



  async function testParams(url: string): Promise<StringPayload>
  async function testParams(url: string, payloadType: 'obj'): Promise<BadReqPayload>
  async function testParams(url: string, payloadType?: 'obj') {
    const { payload, statusCode } = await app.inject({ url, headers: constAuthedHeader });
    return {
      statusCode,
      payload: payloadType == 'obj' && JSON.parse(payload) as BadRequestSchema || JSON.parse(payload) as { hello: string }
    };
  }

});








