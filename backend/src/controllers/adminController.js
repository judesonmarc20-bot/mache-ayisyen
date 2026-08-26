const User = require('../models/User');
const db = require('../db');

exports.listUsers = async (req, res) => {
  res.json({ users: await User.listAll() });
};

// Yon ti "dashboard" estatistik senp pou admin lan. Nou itilize CAST(... AS
// INTEGER/REAL) pou konte yo tounen kòm nonm (pa tèks) nan Postgres.
exports.stats = async (req, res) => {
  const totalUsers = (await db.get(`SELECT CAST(COUNT(*) AS INTEGER) as n FROM users`)).n;
  const totalStores = (await db.get(`SELECT CAST(COUNT(*) AS INTEGER) as n FROM stores`)).n;
  const totalProducts = (await db.get(`SELECT CAST(COUNT(*) AS INTEGER) as n FROM products`)).n;
  const totalOrders = (await db.get(`SELECT CAST(COUNT(*) AS INTEGER) as n FROM orders`)).n;
  const revenue = (
    await db.get(
      `SELECT COALESCE(CAST(SUM(total) AS REAL), 0) as sum FROM orders WHERE status != 'CANCELLED'`
    )
  ).sum;
  res.json({ totalUsers, totalStores, totalProducts, totalOrders, revenue });
};
