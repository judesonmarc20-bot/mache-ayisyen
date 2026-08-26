const { v4: uuid } = require('uuid');
const db = require('../db');

const ShippingZone = {
  async create({ name, fee }) {
    const id = uuid();
    await db.run(`INSERT INTO shipping_zones (id, name, fee) VALUES (?, ?, ?)`, [
      id,
      name,
      fee || 0,
    ]);
    return this.findById(id);
  },
  findById(id) {
    return db.get(`SELECT * FROM shipping_zones WHERE id = ?`, [id]);
  },
  listActive() {
    return db.query(`SELECT * FROM shipping_zones WHERE active = 1 ORDER BY fee ASC`);
  },
  listAll() {
    return db.query(`SELECT * FROM shipping_zones ORDER BY fee ASC`);
  },
  async update(id, { name, fee, active }) {
    const cur = await this.findById(id);
    if (!cur) return null;
    await db.run(`UPDATE shipping_zones SET name = ?, fee = ?, active = ? WHERE id = ?`, [
      name ?? cur.name,
      fee ?? cur.fee,
      active != null ? (active ? 1 : 0) : cur.active,
      id,
    ]);
    return this.findById(id);
  },
  async delete(id) {
    await db.run(`DELETE FROM shipping_zones WHERE id = ?`, [id]);
  },
};

module.exports = ShippingZone;
