const { v4: uuid } = require('uuid');
const db = require('../db');
const { slugify } = require('../utils/slugify');

const Category = {
  async create({ name }) {
    const id = uuid();
    const slug = slugify(name);
    await db.run(`INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)`, [id, name, slug]);
    return this.findById(id);
  },
  findById(id) {
    return db.get(`SELECT * FROM categories WHERE id = ?`, [id]);
  },
  listAll() {
    return db.query(`SELECT * FROM categories ORDER BY name ASC`);
  },
};

module.exports = Category;
