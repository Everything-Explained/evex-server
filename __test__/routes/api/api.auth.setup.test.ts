

import { describe } from 'riteway';
import { build, constAuthedHeader } from '../../test.fastify';
import { BadRequestSchema } from '../../../src/schemas/std-schemas';
import { paths } from '../../../src/config';
import { readFile, writeFile } from 'fs/promises';




const url = '/api/auth/setup';


describe(`POST ${url}`, async t => {
  const app = await build();

  const badRequest = await app.inject({ url, headers: { 'authorization': '12345'} });
  const badPayload = JSON.parse(badRequest.payload) as BadRequestSchema;
  const versionsFile = await readFile(`${paths().data}/_data/versions.json`, { encoding: 'utf-8'});
  t({
    given: 'invalid auth header',
    should: 'send 400 status',
    actual: badPayload.statusCode,
    expected: 400
  });

  t({
    given: 'invalid auth header',
    should: 'send custom message',
    actual: badPayload.message,
    expected: 'Invalid Auth Header'
  });

  const goodRequest = await app.inject({ url, headers: constAuthedHeader });
  const goodPayload = goodRequest.payload as string;
  t({
    given: 'valid existing header',
    should: 'send _data/versions.json',
    actual: goodPayload,
    expected: versionsFile
  });

  const newUserID = '29fj219dj98dh9812hd91h29dh91h2d98h12hd';
  const oldUsers = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'})) as { [key: string]: string };
  const addUserReq = await app.inject({ url, headers: { 'authorization': `Bearer ${newUserID}`}});
  const users = JSON.parse(await readFile('./users.json', { encoding: 'utf-8'})) as { [key: string]: string };
  t({
    given: 'a new auth bearer id',
    should: 'send 201 status',
    actual: addUserReq.statusCode,
    expected: 201
  });

  t({
    given: 'a new auth bearer id',
    should: 'create new user',
    actual: users[newUserID],
    expected: 'nocode'
  });


  // Cleanup everything here
  app.close();
  await writeFile('./users.json', JSON.stringify(oldUsers, null, 2));

});












