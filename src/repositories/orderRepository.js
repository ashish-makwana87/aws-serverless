
export const orderRepository = {
  async insertOrder(client, { userId, totalAmount }) {
    const result = await client.query(
      `INSERT INTO orders (customer_id, total_amount)
       VALUES ($1, $2)
       RETURNING id, customer_id, total_amount, status, created_at`,
      [userId, totalAmount],
    );

    return result.rows[0];
  },

  async insertOrderItem(
    client,
    { orderId, productName, quantity, unitPrice },
  ) {
    const result = await client.query(
      `INSERT INTO order_items
         (order_id, product_name, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_id, product_name, quantity, unit_price`,
      [orderId, productName, quantity, unitPrice],
    );

    return result.rows[0];
  },
};


