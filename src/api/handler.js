import { loadSecrets } from "../config/secrets.js";
import { NotFoundError } from "../utils/httpErrors.js";
import { errorHandler } from "../utils/response.js";
import { routes } from "./routes/index.js";

export const handler = async (event) => {

  try {
    await loadSecrets();
    const path = event.requestContext.http.path;
    const httpMethod = event.requestContext.http.method.toUpperCase();

    //Routing event/request to designated controller
    const handlers = routes[path]?.[httpMethod];
    if (!handlers) {
      throw new NotFoundError("Requested route not found");
    }

    // handlersList is always an array

    const handlersList = Array.isArray(handlers) ? handlers : [handlers];

    for (const fn of handlersList) {
      const response = await fn(event);
      if (response) return response;
    }
  } catch (err) {
    return errorHandler(err);
  }
};
