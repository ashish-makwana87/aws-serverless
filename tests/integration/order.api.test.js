import { jest } from "@jest/globals";

jest.resetModules();

jest.unstable_mockModule("../../src/utils/tokenUtils.js", () => ({
  signJWT: jest.fn(() => "mock-jwt-token"),
  verifyJWT: jest.fn(() => ({
    id: "test-user-123",
    role: "user",
    email: "test@example.com",
    isActive: true,
  })),
}));

jest.unstable_mockModule("../../src/config/secrets.js", () => ({
  loadSecrets: jest.fn().mockResolvedValue({
    jwtSecret: "test-secret",
  }),
  getSecrets: jest.fn(() => ({
    jwtSecret: "test-secret",
  })),
}));

jest.unstable_mockModule(
  "../../src/repositories/dynamoProfileCacheRepository.js",
  () => ({
    createDynamoProfileCacheRepository: jest.fn(() => ({
      get: jest.fn().mockResolvedValue(null),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
  }),
);

const { handler } = await import("../../src/api/handler.js");
const { getOrdersPool, closeOrdersPool } =
  await import("../../src/libs/postgres.js");

let pool;

const buildEvent = ({ method = "POST", body, auth = true }) => ({
  requestContext: {
    http: {
      method,
      path: "/api/v1/orders",
    },
  },
  headers: auth ? { Authorization: "Bearer test-token" } : {},
  body: JSON.stringify(body ?? {}),
});

const validOrder = {
  items: [
    {
      productName: "Keyboard",
      quantity: 2,
      unitPrice: "12.50",
    },
    {
      productName: "Mouse",
      quantity: 1,
      unitPrice: "5.00",
    },
  ],
};

beforeAll(async () => {
  pool = getOrdersPool();

  // These tables are created only in the dedicated orders_test database.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      customer_id TEXT NOT NULL,
      total_amount NUMERIC(12, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_name VARCHAR(200) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(12, 2) NOT NULL
    )
  `);

  // Simulates a database-level failure after the order has been inserted.
  await pool.query(`
    CREATE OR REPLACE FUNCTION test_fail_order_item_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.product_name = '__FAIL_DB_INSERT__' THEN
        RAISE EXCEPTION 'Simulated order item insert failure';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS test_order_item_failure ON order_items
  `);

  await pool.query(`
    CREATE TRIGGER test_order_item_failure
    BEFORE INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION test_fail_order_item_insert()
  `);
});

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE order_items, orders RESTART IDENTITY CASCADE");
});

afterAll(async () => {
  if (pool) {
    await pool.query(`
      DROP TRIGGER IF EXISTS test_order_item_failure ON order_items
    `);
    await pool.query("DROP FUNCTION IF EXISTS test_fail_order_item_insert()");
  }

  await closeOrdersPool();
});

describe("POST /api/v1/orders integration tests", () => {
  it("creates an order and its items in one transaction", async () => {
    const response = await handler(
      buildEvent({ body: validOrder }),
    );

    expect(response.statusCode).toBe(201);

    const orders = await pool.query(
      "SELECT customer_id, total_amount FROM orders",
    );

    const items = await pool.query(
      "SELECT product_name, quantity, unit_price FROM order_items ORDER BY id",
    );

    expect(orders.rowCount).toBe(1);
    expect(orders.rows[0].customer_id).toBe("test-user-123");
    expect(orders.rows[0].total_amount).toBe("30.00");

    expect(items.rowCount).toBe(2);
    expect(items.rows[0]).toMatchObject({
      product_name: "Keyboard",
      quantity: 2,
      unit_price: "12.50",
    });
    expect(items.rows[1]).toMatchObject({
      product_name: "Mouse",
      quantity: 1,
      unit_price: "5.00",
    });
  });

  it("rejects invalid order data without inserting records", async () => {
    const response = await handler(
      buildEvent({
        body: {
          items: [
            {
              productName: "",
              quantity: 0,
              unitPrice: "not-a-price",
            },
          ],
        },
      }),
    );

    expect(response.statusCode).toBe(400);

    const orders = await pool.query("SELECT id FROM orders");
    const items = await pool.query("SELECT id FROM order_items");

    expect(orders.rowCount).toBe(0);
    expect(items.rowCount).toBe(0);
  });

  it("rejects requests without an authentication token", async () => {
    const response = await handler(
      buildEvent({ body: validOrder, auth: false }),
    );

    expect(response.statusCode).toBe(401);

    const orders = await pool.query("SELECT id FROM orders");
    expect(orders.rowCount).toBe(0);
  });

  it("rolls back the order when an item insert fails", async () => {
    const response = await handler(
      buildEvent({
        body: {
          items: [
            {
              productName: "Keyboard",
              quantity: 1,
              unitPrice: "12.50",
            },
            {
              productName: "__FAIL_DB_INSERT__",
              quantity: 1,
              unitPrice: "5.00",
            },
          ],
        },
      }),
    );

    expect(response.statusCode).toBe(500);

    const orders = await pool.query("SELECT id FROM orders");
    const items = await pool.query("SELECT id FROM order_items");

    expect(orders.rowCount).toBe(0);
    expect(items.rowCount).toBe(0);
  });
});
