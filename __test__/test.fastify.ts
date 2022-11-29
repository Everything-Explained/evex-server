// This file contains code that we reuse between our tests.
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import App from '../src/app';
import { useSubDomainHook } from '../src/hooks/sub-domain-hook';
import { pathJoin } from '../src/utils';

export const userID = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
export const r3dUserID = 'zyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba';
export const authorizedHeader = { 'authorization': `Bearer ${userID}`};
export const constAuthedHeader = { 'authorization': `Bearer abqdefbhijklmngpqrstuvhxyoabcdeughijklmnnmqrstuvvxyz`};
export const r3dAuthHeader = { 'authorization': `Bearer ${r3dUserID}`};
export const mockDir = pathJoin(__dirname, '__mocks__');

// Fill in this config with all the configurations
// needed for testing the application
async function config () {
  return {};
}

// Automatically build and tear down our in
async function build () {
  const app = Fastify();

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  void app.register(fp(App), await config());
  useSubDomainHook(app, [
    {
      name: 't-cache',
      cache: true,
      filesPath: pathJoin(mockDir, 'test-cache')
    },
    {
      name: 't-nocache',
      cache: false,
      filesPath: pathJoin(mockDir, 'test-nocache')
    },
  ]);

  await app.ready();

  return app;
}

export {
  config,
  build
};
