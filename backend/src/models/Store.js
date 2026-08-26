const { v4: uuid } = require('uuid');
const db = require('../db');
const { slugify } = require('../utils/slugify');

const Store = {
  async create({ name, description, logoUrl, ownerId }) {
    const id = uuid();
    let slug = slugify(name);
    const exists = await db.get(`SELECT id FROM stores WHERE slug = ?`, [slug]);
    if (exists) slug = `${slug}-${id.slice(0, 6)}`;

    await db.run(
      `INSERT INTO stores (id, name, slug, description, logoUrl, ownerId) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description || null, logoUrl || null, ownerId]
    );
    return this.findById(id);
  },

  findById(id) {
    return db.get(`SELECT * FROM stores WHERE id = ?`, [id]);
  },

  findBySlug(slug) {
    return db.get(`SELECT * FROM stores WHERE slug = ?`, [slug]);
  },

  findByOwnerId(ownerId) {
    return db.get(`SELECT * FROM stores WHERE ownerId = ?`, [ownerId]);
  },

  listAll() {
    return db.query(`SELECT * FROM stores ORDER BY createdAt DESC`);
  },

  listActive() {
    return db.query(`SELECT * FROM stores WHERE active = 1 ORDER BY createdAt DESC`);
  },

  async update(id, fields) {
    const current = await this.findById(id);
    if (!current) return null;
    const next = { ...current, ...fields };
    await db.run(
      `UPDATE stores SET name = ?, description = ?, logoUrl = ?, active = ? WHERE id = ?`,
      [next.name, next.description, next.logoUrl, next.active ? 1 : 0, id]
    );
    return this.findById(id);
  },
};

module.exports = Store;
