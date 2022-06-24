

import { describe } from 'riteway';
import { authorizedHeader, build } from '../../test.fastify';
import { FastifyInstance } from 'fastify';




const url = '/api/data';


describe('GET /api/data', async t => {
  const app = await build();

  t({
    given: '/data',
    should: 'send 403 status',
    actual: await testNoParams(app),
    expected: 403
  });

  t({
    given: '/data/dir',
    should: 'send /data/dir/dir.json',
    actual: await testSingleParamNoExt(app),
    expected: true
  });

  t({
    given: '/data/file.json',
    should: 'send /data/file.json',
    actual: await testSingleParamExt(app),
    expected: true
  });

  t({
    given: '/data/dir/dir',
    should: 'send /data/dir/dir/dir.json',
    actual: await testDoubleParamNoExt(app),
    expected: true
  });

  t({
    given: '/data/dir/file.json',
    should: 'send /data/dir/file.json',
    actual: await testDoubleParamExt(app),
    expected: true
  });

  t({
    given: '/data/dir/dir/file.json',
    should: 'send /data/dir/dir/file.json',
    actual: await testTripleParamExt(app),
    expected: true
  });

  t({
    given: '/data/dir/file.mdhtml',
    should: 'send /data/dir/file.mdhtml',
    actual: await testMDHTML(app),
    expected: true
  });

  t({
    given: '/data/file.nonSupportedExt',
    should: 'send 400 status & message',
    actual: await testUnsupportedExt(app),
    expected: true
  });

  t({
    given: '/data/fileNotExist.json',
    should: 'send 404 status & message',
    actual: await testFileNotFound(app),
    expected: true
  });


  // Cleanup everything here
  app.close();

});


async function testNoParams(app: FastifyInstance) {
  const { statusCode } = await app.inject({ url, headers: authorizedHeader });
  return statusCode;
}

async function testSingleParamNoExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/blog`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 200;
}

async function testSingleParamExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/versions.json`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 200;
}

async function testDoubleParamNoExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/videos/public`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 200;
}

async function testDoubleParamExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/blog/blog.json`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 200;
}

async function testTripleParamExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/literature/public/147769512.mdhtml`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 300;
}

async function testMDHTML(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/blog/32167398.mdhtml`, headers: authorizedHeader });
  return statusCode == 200 && typeof payload == 'string' && payload.length > 300;
}

async function testUnsupportedExt(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/blog/test.html`, headers: authorizedHeader });
  return statusCode == 400 && payload.includes('Unsupported');
}

async function testFileNotFound(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url: `${url}/fileNotExist.json`, headers: authorizedHeader });
  return statusCode == 404 && payload.includes('Not Found');
}










