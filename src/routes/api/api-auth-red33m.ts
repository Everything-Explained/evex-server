

import { Type } from "@sinclair/typebox";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { APIRequest } from "../../hooks/api-auth-hook";
import * as argon from 'argon2';
import { updateUser } from "../../database/users";
import { serverConfig } from "../../config";





type AuthRed33mRequest = APIRequest & {
  Body: { passcode: string };
}

const apiOptions: RouteShorthandOptions = {
  schema: {
    body: Type.Strict(Type.Required(Type.Object({
      passcode: Type.String()
    }))),
    response: {
      201: Type.String(),
    },
  }
};


const useAuthRed33mRoute = (fastify: FastifyInstance, rootURL: string) => {
  fastify.put<AuthRed33mRequest>(`${rootURL}/auth/red33m`, apiOptions, async (req, res) => {
    const { isRed33med, passcode, userID } = req.body;

    if (isRed33med) {
      return res.conflict('Already Logged In');
    }

    if (!passcode.trim()) {
      return res.badRequest('Missing Passcode');
    }

    if (!await argon.verify(serverConfig.auth.red33m, passcode)) {
      return res.badRequest('Invalid Passcode');
    }

    updateUser(userID, 'code');
    res.code(201);
    return 'OK';
  });
};




export default useAuthRed33mRoute;


