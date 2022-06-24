

import { describe } from 'riteway';
import { build } from './test.fastify';
import { FastifyInstance } from 'fastify';




const url = '/root/testURL';


describe('thing to test', async t => {
  const app = await build();

  t({
    given: 'something',
    should: 'do something',
    actual: await someTest(app),
    expected: true
  });

  // Cleanup everything here
  app.close();

});


async function someTest(app: FastifyInstance) {
  const { payload, statusCode } = await app.inject({ url });
  return typeof payload == 'string' && statusCode == 404;
}










