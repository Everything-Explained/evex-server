

import { readFile, writeFile } from 'fs/promises';
import { test } from 'tap';
import { build, is201, is400, is409 } from '../../test.fastify';
import * as config from '../../../config.json';



test('/api/auth/red33m', async (t) => {
  const app = await build(t);
  const url = '/api/auth/red33m';
  const userID = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
  const r3dUserID = 'zyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba';
  const authorizedHeader = { 'authorization': `Bearer ${userID}`};
  const r3dAuthHeader = { 'authorization': `Bearer ${r3dUserID}`};

  const res2 = await app.inject({ url, method: 'PUT', headers: authorizedHeader });
  const requiresPasscode = res2.payload.includes(`required property 'passcode'`);
  t.equal(is400(res2.payload) && requiresPasscode, true, 'rejects with 400, when missing passcode');

  const res3 = await app.inject({ url, method: 'PUT', headers: authorizedHeader, payload: { passcode: 'asdf' }});
  const hasInvalidPasscode = res3.payload.includes('Invalid Passcode');
  t.equal(is400(res3.payload) && hasInvalidPasscode, true, 'rejects with 400, when passcode invalid');

  const res4 = await app.inject({ url, method: 'PUT', headers: r3dAuthHeader, payload: { passcode: 'asdf' }});
  t.equal(is409(res4.payload), true, 'rejects with 409, when user already logged in');

  const res5 = await app.inject({
    url,
    method: 'PUT',
    headers: authorizedHeader,
    payload: { passcode: config.auth.testPasscode }
  });

  const is201 = res5.statusCode == 201;
  t.equal(is201 && res5.payload == 'OK', true, 'responds with 201, when passcode is valid');
  const users = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'}));
  t.equal(users[userID], 'code', 'updates user ID entry with "code", when passcode is valid');

  const res6 = await app.inject({
    url,
    method: 'PUT',
    headers: authorizedHeader,
    payload: { passcode: config.auth.testPasscode }
  });
  t.equal(is409(res6.payload), true, 'recognizes new red33m users without restart');

  // Cleanup
  users[userID] = 'nocode';
  await writeFile('./users.json', JSON.stringify(users, null, 2));

});





