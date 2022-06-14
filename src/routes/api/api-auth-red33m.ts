

 import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { APIRequest } from "../../hooks/authorize-api";




/**
 * Route  : /api/auth/red33m
 * Method : PUT
 * Body   : { passcode: string; }
 */

// interface AuthRed33mRequest extends APIRequest {
//   //
// }

const red33mBody = Type.Object({
  passcode: Type.String()
});

type AuthRed33mRequest = APIRequest & {
  Body: Static<typeof red33mBody>
}

const apiOptions: RouteShorthandOptions = {
  schema: {
    body: Type.Strict(Type.Required(Type.Object({
      passcode: Type.String()
    }))),
    response: {
      400: Type.String(),
      403: Type.Strict(Type.Object({
        statusCode: Type.String(),
        message: Type.String(),
      })),
      200: Type.String(),
    },
  }
};


const useAuthRed33mRoute = (fastify: FastifyInstance, rootURL: string) => {
  fastify.put<AuthRed33mRequest>(`${rootURL}/auth/red33m`, apiOptions, (req, res) => {
    const { isRed33med, passcode } = req.body;
    res.log.info(`isRed33med: ${isRed33med}`);
    res.log.info(`passcode: ${passcode}`);


    if (isRed33med) {
      return res.forbidden();
    }

    // if (!passcode || !passcode.trim().length) {
    //   res.code(403);
    //   return 'Forbidden';
    // }

    ////////////////////
    // Verify passcode
    ////////////////////

    return 'not red33med';
  });
};




export default useAuthRed33mRoute;


