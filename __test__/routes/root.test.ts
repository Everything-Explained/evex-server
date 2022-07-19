

import { readFile } from 'fs/promises';
import { describe } from 'riteway';
import { paths } from '../../src/config';
import { build, constAuthedHeader } from '../test.fastify';




describe('GET /', async t => {
  const app = await build();

  const indexPage = await readFile(`${paths().client}/index.html`, { encoding: 'utf-8'});
  t({
    given: '/ request',
    should: 'send index',
    actual: (await testRoot()).payload,
    expected: indexPage,
  });
  t({
    given: '/ request',
    should: 'not cache index',
    actual: (await testRoot()).headers['cache-control'],
    expected: 'public, max-age=0',
  });


  t({
    given: `a file request`,
    should: 'send file',
    actual: (await testRoot('/robots.txt')).payload,
    expected: 'User-agent: *\r\nAllow: /',
  });
  t({
    given: `a file request`,
    should: 'cache file',
    actual: (await testRoot('/robots.txt')).headers['cache-control'],
    expected: 'max-age=31536000',
  });


  // Cleanup everything here
  app.close();

  async function testRoot(url = '/', header = constAuthedHeader) {
    const { statusCode, payload, headers } = await app.inject({ url, headers: header });
    return {
      statusCode,
      payload,
      headers,
    };
  }

});










