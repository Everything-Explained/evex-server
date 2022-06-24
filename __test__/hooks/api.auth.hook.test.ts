import { FastifyInstance } from "fastify";
import { describe } from "riteway";
import { build, userID } from "../test.fastify";



const url = '/api';



describe('/api auth hook', async t => {
  const app = await build();

  t({
    given: 'missing auth header',
    should: 'send 401 status',
    actual: await testMissingAuthHeader(app),
    expected: 401,
  });

  t({
    given: '"Bearer" missing in auth header',
    should: 'send 401 status',
    actual: await testMissingAuthBearer(app),
    expected: 401,
  });

  t({
    given: 'a missing Bearer token',
    should: 'send 401 status',
    actual: await testMissingAuthToken(app),
    expected: 401,
  });

  t({
    given: 'a Bearer token length < 20',
    should: 'send 401 status',
    actual: await testAuthTokenLength(app),
    expected: 401,
  });

  t({
    given: 'an authenticated Bearer token',
    should: 'goto next route handler',
    actual: await testValidAuth(app),
    expected: 403,
  });

  t({
    given: 'an unauthorized /auth/setup url',
    should: 'skip auth check',
    actual: await testAuthSetupCondition(app),
    expected: 400,
  });


  app.close();
});


async function testMissingAuthHeader(app: FastifyInstance) {
  const { statusCode } = await app.inject({ url, });
  return statusCode;
}


async function testMissingAuthBearer(app: FastifyInstance) {
 const { statusCode } = await app.inject({ url: '/api', headers: { 'authorization': 'asdf' }});
 return statusCode
}


async function testMissingAuthToken(app: FastifyInstance) {
 const { statusCode } = await app.inject({ url: '/api', headers: { 'authorization': 'Bearer' } });
 return statusCode;
}


async function testAuthTokenLength(app: FastifyInstance) {
  const { statusCode } = await app.inject({ url: '/api', headers: { 'authorization': 'Bearer NotLongEnough' } });
  return statusCode;
}


async function testValidAuth(app: FastifyInstance) {
  const { statusCode } = await app.inject({ url: '/api/should404', headers: { 'authorization': `Bearer ${userID}` } });
  return statusCode;
}


async function testAuthSetupCondition(app: FastifyInstance) {
  const { statusCode } = await app.inject({ url: '/api/auth/setup', headers: { 'authorization': `Bearer blah` } });
  return statusCode;
}









