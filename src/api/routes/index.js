import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { orderRoutes } from "./order.routes.js";
import { userRoutes } from "./user.routes.js";

export const routes = {
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  ...orderRoutes
};
