# /API
## **Authentication Hook**
* Activates on all **/api** requests
- Validates `authorization` header
	- Header should contain `Bearer <userid>`

## *GET:* **/api** or **/api\*\***
Unless the route is used with recognized parameters, it will be rejected. On top of that, any requests that are not recognized, will be labeled as *suspicious* activity.

## *GET:* `/api/data/P1` or `/api/data/P1/P2` or `/api/data/P1/P2/P3`
The *P* represents a parameter. A parameter can be either a directory name or file name. If *P* is a file name, then it must include a file extension: `/api/data/p.json`. If *P* is a directory, then that directory must exist on the server as `/api/data/P/P.json` where the last *P* is considered to be a JSON file within *P* directory.

Lastly, **only** `.mdhtml` and `.json` file extensions are supported on this route.

## *GET:* **/api/auth/setup**
Returns a list of static page versions in JSON format and authenticates the `<userid>` on first visit.

## *GET* **/api/auth/red33m**
- If a user is already a RED33M user, the request is rejected
- The request must include the *passcode*
- If the *passcode* is invalid, the request is rejected
- If the *passcode* is valid, the `<userid>` is updated internally with RED33M state and a `201` is sent.
