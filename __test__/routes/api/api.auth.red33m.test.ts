

import { readFile, writeFile } from 'fs/promises';
import { build, is400, is409 } from '../../test.fastify';
import { describe } from 'riteway';
import * as config from '../../../config.json';
import { FastifyInstance } from 'fastify';



const url = '/api/auth/red33m';
const userID = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
const r3dUserID = 'zyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba';
const authorizedHeader = { 'authorization': `Bearer ${userID}`};
const r3dAuthHeader = { 'authorization': `Bearer ${r3dUserID}`};


describe('PUT /api/auth/red33m', async t => {
  const app = await build();

  t({
    given: 'no passcode',
    should: 'send 400 status & message',
    actual: await testRequiredPasscode(app),
    expected: true
  });

  t({
    given: 'an invalid passcode',
    should: 'send 400 status & message',
    actual: await testInvalidPasscode(app),
    expected: true,
  });

  t({
    given: 'an empty passcode',
    should: 'send 400 status & message',
    actual: await testEmptyPasscode(app),
    expected: true,
  });

  t({
    given: 'already existing credentials',
    should: 'send 409 status & message',
    actual: await testAlreadyLoggedIn(app),
    expected: true,
  });

  t({
    given: 'valid passcode',
    should: 'send 201 & "OK"',
    actual: await testLoginSuccess(app),
    expected: true,
  });

  t({
    given: 'valid passcode',
    should: 'update user with "code"',
    actual: await testUserAddedOnLogin(),
    expected: 'code',
  });

  t({
    given: 'a new logged in user',
    should: 'recognize user',
    actual: await testNewLoggedInUser(app),
    expected: true,
  });

  // cleanup
  await app.close();
});


async function testRequiredPasscode(app: FastifyInstance) {
  const { payload } = await app.inject({ url, method: 'PUT', headers: authorizedHeader });
  return is400(payload) && payload.includes(`required property 'passcode'`);
}


async function testInvalidPasscode(app: FastifyInstance) {
  const { payload } = await app.inject({ url, method: 'PUT', headers: authorizedHeader, payload: { passcode: 'asdf' }});
  return payload.includes('Invalid Passcode') && is400(payload);
}


async function testEmptyPasscode(app: FastifyInstance) {
  const  { payload } = await app.inject({ url, method: 'PUT', headers: authorizedHeader, payload: { passcode: '   ' }});
  return is400(payload) && payload.includes('Missing Passcode');
}


async function testAlreadyLoggedIn(app: FastifyInstance) {
  const { payload } = await app.inject({ url, method: 'PUT', headers: r3dAuthHeader, payload: { passcode: 'asdf' }});
  return is409(payload) && payload.includes('Already Logged In');
}


async function testLoginSuccess(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({
    url,
    method: 'PUT',
    headers: authorizedHeader,
    payload: { passcode: config.auth.testCode }
  });
  return statusCode == 201 && payload == 'OK';
}


async function testUserAddedOnLogin() {
  const users = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'}));
  return users[userID];
}


async function testNewLoggedInUser(app: FastifyInstance) {
  const { payload } = await app.inject({
    url,
    method: 'PUT',
    headers: authorizedHeader,
    payload: { passcode: config.auth.testCode }
  });

  // Cleanup
  const users = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'}));
  users[userID] = 'nocode';
  await writeFile('./users.json', JSON.stringify(users, null, 2));
  return is409(payload);
}




