

import { readFile, writeFile } from 'fs/promises';
import { authorizedHeader, build, constAuthedHeader, r3dAuthHeader, userID } from '../../test.fastify';
import { describe } from 'riteway';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';
import { getUserState } from '../../../src/database/users';



const url = '/api/auth/red33m';



describe('PUT /api/auth/red33m', async t => {
  const app = await build();


  const testRequiredPasscode =  await testPasscode();
  t({
    given: 'no passcode',
    should: 'send 400 status',
    actual: testRequiredPasscode.statusCode,
    expected: 400
  });

  t({
    given: 'no passcode',
    should: 'send custom message',
    actual: testRequiredPasscode.message,
    expected: `body must have required property 'passcode'`
  });

  const testInvalidPasscode = await testPasscode({ passcode: 'asdf'});
  t({
    given: 'an invalid passcode',
    should: 'send 400 status',
    actual: testInvalidPasscode.statusCode ,
    expected: 400,
  });

  t({
    given: 'an invalid passcode',
    should: 'send custom message',
    actual: testInvalidPasscode.message,
    expected: 'Invalid Passcode',
  });

  const testEmptyPasscode = await testPasscode({ passcode: '        '});
  t({
    given: 'an empty passcode',
    should: 'send 400 status',
    actual: testEmptyPasscode.statusCode,
    expected: 400,
  });

  t({
    given: 'an empty passcode',
    should: 'send custom message',
    actual: testEmptyPasscode.message,
    expected: 'Missing Passcode',
  });

  const testAlreadyLoggedIn = await testPasscode({ passcode: 'hello world'}, r3dAuthHeader);
  t({
    given: 'already existing credentials',
    should: 'send 409 status',
    actual: testAlreadyLoggedIn.statusCode,
    expected: 409,
  });

  t({
    given: 'already existing credentials',
    should: 'send custom message',
    actual: testAlreadyLoggedIn.message,
    expected: 'Already Logged In',
  });

  const testLoginSuccess = await testPasscode({passcode: 'hello world'}, authorizedHeader);
  t({
    given: 'valid passcode',
    should: 'send 201 status',
    actual: testLoginSuccess.statusCode,
    expected: 201,
  });

  const newUsersObj = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'}));
  t({
    given: 'valid passcode',
    should: 'update user.json with "code"',
    actual: newUsersObj[userID],
    expected: 'code',
  });

  t({
    given: 'a new logged in user',
    should: 'recognize user',
    actual: getUserState(userID),
    expected: 'code',
  });

  // cleanup
  await app.close();
  const users = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'}));
  users[userID] = 'nocode';
  await writeFile('./users.json', JSON.stringify(users, null, 2));



  async function testPasscode(p = {}, headers = constAuthedHeader) {
    const { statusCode, payload } = await app.inject({
      url,
      method: 'PUT',
      headers,
      payload: p,
    });
    return {
      statusCode,
      message: (payload.includes('{')) && (JSON.parse(payload) as BadRequestSchema).message || payload
    };
  }


});




