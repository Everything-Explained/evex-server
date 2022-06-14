
import { FastifyInstance } from "fastify";
import { addUser } from "../../database/users";
import { APIRequest } from "../../hooks/authorize-api";








const useAuthSetupRoute = (fastify: FastifyInstance, rootURl: string) => {
  fastify.get<APIRequest>(`${rootURl}/auth/setup`, (req, res) => {
    const { hasValidID, userID, isAuthorized } = req.body;

    if (!hasValidID) {
      res.code(403);
      res.send('Forbidden');
      return;
    }


    /////////////////////////////
    // read from version file
    ////////////////////////////


    if (isAuthorized) {
      return 'send authorized version data';
    }

    addUser(userID);

    res.code(201);
    return 'send created version data';
  });
};

export default useAuthSetupRoute;

