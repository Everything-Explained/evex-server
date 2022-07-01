import { IncomingHttpHeaders } from "http";
import { describe } from "riteway";
import { build, userID } from "../test.fastify";



const url = '/api';



describe('/api auth hook', async t => {
  const app = await build();

  t({
    given: 'missing auth header',
    should: 'send 401 status',
    actual: (await testHeader(url, {})),
    expected: 401,
  });

  t({
    given: '"Bearer" missing in auth header',
    should: 'send 401 status',
    actual: (await testHeader(url, { 'authorization': 'asdf' })),
    expected: 401,
  });

  t({
    given: 'a missing Bearer token',
    should: 'send 401 status',
    actual: (await testHeader(url, { 'authorization': 'Bearer' })),
    expected: 401,
  });

  t({
    given: 'a Bearer token length < 20',
    should: 'send 401 status',
    actual: (await testHeader(url, { 'authorization': 'Bearer NotLongEnough' })),
    expected: 401,
  });

  t({
    given: 'an authenticated Bearer token',
    should: 'goto next route handler',
    actual: (await testHeader(`${url}/should404`, { 'authorization': `Bearer ${userID}` })),
    expected: 403,
  });

  t({
    given: 'an unauthorized /auth/setup url',
    should: 'skip auth check',
    actual: (await testHeader(`${url}/auth/setup`, { 'authorization': 'Bearer blah' })),
    expected: 400,
  });


  // Cleanup below here
  app.close();


  async function testHeader(url: string, headers: IncomingHttpHeaders) {
    const { statusCode } = await app.inject({ url, headers, });
    return statusCode;
  }
});









