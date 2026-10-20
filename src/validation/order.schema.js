import { z } from "zod";

const moneySchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
    "Price must be a non-negative amount with up to 2 decimal places",
  );

const orderItemSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(100),
});
