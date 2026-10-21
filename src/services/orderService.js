import { BadRequestError } from "../utils/httpErrors.js";

const MAX_TOTAL_CENTS = 999999999999n;

function moneyToCents(amount) {
  const [whole, fraction = ""] = amount.split(".");

  return (
    BigInt(whole) * 100n +
    BigInt(fraction.padEnd(2, "0"))
  );
}

function centsToMoney(cents) {
  const whole = cents / 100n;
  const fraction = String(cents % 100n).padStart(2, "0");

  return `${whole}.${fraction}`;
}

export function createOrderService({
  orderRepository,
  getOrdersPool,
}) {

  return {
    async createOrder({ userId, items }) {
      const totalCents = items.reduce(
        (total, item) =>
          total + moneyToCents(item.unitPrice) * BigInt(item.quantity),
        0n,
      );

      if (totalCents > MAX_TOTAL_CENTS) {
        throw new BadRequestError(
          "Order total exceeds the supported amount",
        );
      }

      const totalAmount = centsToMoney(totalCents);
      const client = await getOrdersPool().connect();

      let transactionStarted = false;

      try {
        await client.query("BEGIN");
        transactionStarted = true;

        const order = await orderRepository.insertOrder(client, {
          userId,
          totalAmount,
        });

        const savedItems = [];

        for (const item of items) {
          const savedItem = await orderRepository.insertOrderItem(
            client,
            {
              orderId: order.id,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
          );

          savedItems.push(savedItem);
        }

        await client.query("COMMIT");
        transactionStarted = false;

        return {
          id: order.id,
          customerId: order.customer_id,
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at,
          items: savedItems.map((item) => ({
            id: item.id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
          })),
        };
      } catch (error) {
        if (transactionStarted) {
          try {
            await client.query("ROLLBACK");
          } catch (rollbackError) {
            console.error("Order transaction rollback failed", {
              message: rollbackError.message,
            });
          }
        }

        throw error;
      } finally {
        client.release();
      }
    },
  };
}



