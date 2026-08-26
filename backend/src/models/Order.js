const { v4: uuid } = require('uuid');
const db = require('../db');
const Cart = require('./Cart');
const Coupon = require('./Coupon');
const ShippingZone = require('./ShippingZone');

const Order = {
  // Kreye yon kòmand PENDING soti nan panye a. NOU PA touche estòk ni panye
  // a la a -- sa rive SÈLMAN lè peman an konfime reyisi, nan markPaid().
  //
  // opts: { shippingZoneId, couponCode, paymentMethod }
  async createPending(userId, opts = {}) {
    const items = await Cart.getItems(userId);
    if (items.length === 0) {
      throw new Error('Panye a vid, pa gen anyen pou peye.');
    }
    for (const item of items) {
      if (item.stock < item.quantity) {
        throw new Error(`Pa gen ase estòk pou "${item.name}" (rete: ${item.stock}).`);
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Koupon (opsyonèl)
    let discount = 0;
    let couponCode = null;
    let couponId = null;
    if (opts.couponCode) {
      const result = await Coupon.validate(opts.couponCode, subtotal);
      if (!result.valid) throw new Error(result.error);
      discount = result.discount;
      couponCode = result.coupon.code;
      couponId = result.coupon.id;
    }

    // Livrezon (opsyonèl)
    let shippingFee = 0;
    let shippingZoneName = null;
    if (opts.shippingZoneId) {
      const zone = await ShippingZone.findById(opts.shippingZoneId);
      if (!zone || !zone.active) throw new Error('Zòn livrezon an pa valab.');
      shippingFee = zone.fee;
      shippingZoneName = zone.name;
    }

    const paymentMethod = opts.paymentMethod === 'CARD' ? 'CARD' : 'MONCASH';
    const total = Math.round((subtotal - discount + shippingFee) * 100) / 100;
    const orderId = uuid();

    await db.tx(async (t) => {
      await t.run(
        `INSERT INTO orders
          (id, status, subtotal, discount, couponCode, shippingFee, shippingZone, paymentMethod, total, userId)
         VALUES (?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, subtotal, discount, couponCode, shippingFee, shippingZoneName, paymentMethod, total, userId]
      );

      for (const item of items) {
        await t.run(
          `INSERT INTO order_items (id, quantity, unitPrice, orderId, productId, storeId, productName)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuid(), item.quantity, item.price, orderId, item.productId, item.storeId, item.name]
        );
      }

      if (couponId) {
        await t.run(`UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?`, [couponId]);
      }
    });

    return this.findById(orderId);
  },

  // Rele SÈLMAN apre peman konfime: redwi estòk (ak yon verifikasyon final),
  // vide panye a, epi make kòmand lan PAID. Si kòmand lan deja PAID, nou pa
  // fè anyen ankò (evite double-trete).
  async markPaid(orderId) {
    const order = await this.findById(orderId);
    if (!order) throw new Error('Kòmand pa jwenn.');
    if (order.status === 'PAID') return order;

    await db.tx(async (t) => {
      for (const item of order.items) {
        const result = await t.run(
          `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.productId, item.quantity]
        );
        if (result.changes === 0) {
          throw new Error(`Pa gen ase estòk pou "${item.productName}" ankò.`);
        }
      }
      await t.run(`UPDATE orders SET status = 'PAID' WHERE id = ?`, [orderId]);
      await t.run(`DELETE FROM cart_items WHERE userId = ?`, [order.userId]);
    });

    return this.findById(orderId);
  },

  async markCancelled(orderId) {
    await db.run(`UPDATE orders SET status = 'CANCELLED' WHERE id = ?`, [orderId]);
    return this.findById(orderId);
  },

  async findById(id) {
    const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!order) return null;
    order.items = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [id]);
    return order;
  },

  async listByUser(userId) {
    const orders = await db.query(
      `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    );
    for (const o of orders) {
      o.items = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [o.id]);
    }
    return orders;
  },

  // Kòmand ki gen omwen yon pwodwi ki soti nan yon magazen espesifik.
  async listByStore(storeId) {
    const rows = await db.query(
      `SELECT DISTINCT o.* FROM orders o
       JOIN order_items oi ON oi.orderId = o.id
       WHERE oi.storeId = ?
       ORDER BY o.createdAt DESC`,
      [storeId]
    );
    for (const o of rows) {
      o.items = await db.query(
        `SELECT * FROM order_items WHERE orderId = ? AND storeId = ?`,
        [o.id, storeId]
      );
    }
    return rows;
  },

  async listAll() {
    const orders = await db.query(`SELECT * FROM orders ORDER BY createdAt DESC`);
    for (const o of orders) {
      o.items = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [o.id]);
    }
    return orders;
  },

  async updateStatus(id, status) {
    await db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    return this.findById(id);
  },
};

module.exports = Order;
