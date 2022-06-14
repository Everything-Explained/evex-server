

import { FastifyInstance } from "fastify";
import { getUserState } from "../database/users";




export type APIRequest = {
  Body: {
    userID       : string;
    hasValidID   : boolean;
    isAuthorized : boolean;
    isRed33med   : boolean;
  }
}




export const useAuthHook = (fastify: FastifyInstance, rootURL: string) => {
  fastify.addHook('preValidation', (req, res, done) => {
    const authHeader = req.headers['authorization'];
    const isAuthSetup = req.url == `${rootURL}/auth/setup`;
    let userID = '';
    let userState: string|undefined = '';

    const hasValidID = !!(
           authHeader
        && authHeader.includes('Bearer')
        && (userID = authHeader.split(' ')[1])
        && userID.trim().length
    );

    const isAuthorized = !!(
      hasValidID && (userState = getUserState(userID))
    );

    const isRed33med = !!(
      isAuthorized && (userState == 'code')
    );

    if (isAuthorized || (!isAuthorized && isAuthSetup)) {
      req.body = {
        ...req.body as object,
        hasValidID,
        userID: hasValidID && userID || undefined,
        isAuthorized,
        isRed33med
      };
      done();
    }
    else {
      res.code(401);
      done(Error('Not Authorized'));
    }

  });
};


