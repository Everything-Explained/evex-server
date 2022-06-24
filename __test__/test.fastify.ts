// This file contains code that we reuse between our tests.
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import App from '../src/app';

export const is201 = (payload: string) => payload.includes('"statusCode":201');
export const is400 = (payload: string) => payload.includes('"statusCode":400');
export const is401 = (payload: string) => payload.includes('"statusCode":401');
export const is409 = (payload: string) => payload.includes('"statusCode":409');

export const userID = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
export const r3dUserID = 'zyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba';
export const authorizedHeader = { 'authorization': `Bearer ${userID}`};
export const r3dAuthHeader = { 'authorization': `Bearer ${r3dUserID}`};

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

  await app.ready();

  return app;
}

export {
  config,
  build
};
