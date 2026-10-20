import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema } from "../../validation/order.schema.js";
import { createOrderController } from "../../controllers/order/createOrderController.js";

export const orderRoutes = {
  "/api/v1/orders": {
    POST: [
      authMiddleware,
      validate(createOrderSchema),
      createOrderController,
    ],
  },
};