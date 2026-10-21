import { orderService } from "../../config/container.js";
import { created } from "../../utils/response.js";

export const createOrderController = async (event) => {
  
 const userId = event.user.id;

  const order = await orderService.createOrder({
    userId,
    items: event.validatedBody.items,
  });

  return created(order);
};