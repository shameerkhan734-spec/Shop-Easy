const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json({ limit: "100kb" }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "shopeasy",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "shopeasy",
  waitForConnections: true,
  connectionLimit: 10
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({ status: "error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT id, name, description, price FROM products ORDER BY id"
    );

    res.json(products);
  } catch (error) {
    console.error("Product query failed:", error.message);
    res.status(500).json({ error: "Unable to retrieve products" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { productId, quantity } = req.body;

  if (
    !Number.isSafeInteger(productId) ||
    productId < 1 ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    return res.status(400).json({
      error: "Provide a valid productId and quantity (1-100)"
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.execute(
      "SELECT id, price FROM products WHERE id = ? FOR UPDATE",
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    const total = Number(
      (products[0].price * quantity).toFixed(2)
    );

    const [result] = await connection.execute(
      "INSERT INTO orders (product_id, quantity, total) VALUES (?, ?, ?)",
      [productId, quantity, total]
    );

    await connection.commit();

    res.status(201).json({
      orderId: result.insertId,
      productId,
      quantity,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error("Order creation failed:", error.message);
    res.status(500).json({ error: "Unable to create order" });
  } finally {
    connection.release();
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  try {
    const [orders] = await pool.execute(
      `SELECT id, product_id, quantity, total, created_at
       FROM orders WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error("Order lookup failed:", error.message);
    res.status(500).json({ error: "Unable to retrieve order" });
  }
});

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`ShopEasy API listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);