
import { Type } from "@sinclair/typebox";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { paths } from "../../config";
import { addUser } from "../../database/users";
import { APIRequest } from "../../hooks/api-auth-hook";
import { defaultResponseSchema } from "../../schemas/std-schemas";
import { pathJoin } from "../../utils";



const dataPath = pathJoin(paths.data, '_data');
const authSetupSchema: RouteShorthandOptions = {
  schema: {
    response: {
      ...defaultResponseSchema,
    }
  }
};



const useAuthSetupRoute = (fastify: FastifyInstance, rootURl: string) => {
  fastify.get<APIRequest>(`${rootURl}/auth/setup`, authSetupSchema, async (req, res) => {
    const { hasValidID, userID, isAuthorized } = req.body;

    if (!hasValidID) {
      return res.badRequest('Invalid Auth Header');
    }

    if (!isAuthorized) {
      await addUser(userID);
      res.code(201);
    }

    return res.sendFile('/versions.json', dataPath);
  });
};



export default useAuthSetupRoute;

