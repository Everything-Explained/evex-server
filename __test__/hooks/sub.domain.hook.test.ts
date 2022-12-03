

import { readFile } from 'fs/promises';
import { describe } from 'riteway';
import { paths } from '../../src/config';
import { pathResolve } from '../../src/utils';
import { build, constAuthedHeader } from '../test.fastify';




const subDomainPath = pathResolve(paths.subDomain, 'web-sub-meet', 'src');


describe.skip('Sub Domain -- onRequest() hook', async t => {
  const app = await build();

  t({
    given: 'existing subdomain',
    should: 'send 200 status',
    actual: (await testHook()).statusCode,
    expected: 200
  });

  const subDomainIndex =
    await readFile(`${subDomainPath}/index.html`, { encoding: 'utf-8'})
  ;
  t({
    given: 'existing subdomain',
    should: 'send index',
    actual: (await testHook()).payload,
    expected: subDomainIndex
  });

  const clientIndex = await readFile(`${paths.client}/index.html`, { encoding: 'utf-8'});
  t({
    given: 'no subdomain',
    should: 'pass to next route handler',
    actual: (await testHook('localhost')).payload,
    expected: clientIndex
  });


  t({
    given: 'cached subdomain index request',
    should: 'send index',
    actual: (await testHook('t-cache.localhost')).payload,
    expected: 'test cache'
  });
  t({
    given: 'cached subdomain index request',
    should: 'not cache index',
    actual: (await testHook('t-cache.localhost')).headers['cache-control'],
    expected: 'public, max-age=0'
  });


  t({
    given: 'cached subdomain asset request',
    should: 'send asset',
    actual: (await testHook('t-cache.localhost', '/test-cache.txt')).payload,
    expected: 'test cache txt'
  });
  t({
    given: 'cached subdomain asset request',
    should: 'cache asset',
    actual: (await testHook('t-cache.localhost', '/test-cache.txt')).headers['cache-control'],
    expected: 'max-age=31536000'
  });


  t({
    given: 'uncached subdomain asset request',
    should: 'send asset',
    actual: (await testHook('t-nocache.localhost', '/test-nocache.txt')).payload,
    expected: `test nocache txt`
  });
  t({
    given: 'uncached subdomain asset request',
    should: 'not cache asset',
    actual: (await testHook('t-nocache.localhost', '/test-nocache.txt')).headers['cache-control'],
    expected: 'public, max-age=0'
  });

  // Cleanup everything here
  app.close();


  async function testHook(hostname = 'meet.localhost', url = '/', header = constAuthedHeader) {
    const { statusCode, payload, headers } = await app.inject(
      { url: { pathname: url, hostname }, headers: header, }
    );
    return {
      statusCode,
      payload,
      headers,
    };
  }

});










