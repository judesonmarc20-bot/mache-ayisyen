// =========================================================================
// User.js — Aksè baz done pou tab "users"
// =========================================================================
// Chak fonksyon isit se yon "query" SQL byen izole. Tout metòd yo "async"
// paske kouch baz done a (db.js) mache ak toude SQLite ak PostgreSQL, epi
// Postgres travay an asynchrone. Rès kòd la dwe "await" apèl sa yo.
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../db');

function toPublic(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

const User = {
  async create({ email, password, name, role = 'CUSTOMER' }) {
    const id = uuid();
    const hash = bcrypt.hashSync(password, 10);
    await db.run(
      `INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
      [id, email.toLowerCase(), hash, name, role]
    );
    return toPublic(await this.findById(id));
  },

  findById(id) {
    return db.get(`SELECT * FROM users WHERE id = ?`, [id]);
  },

  findByEmail(email) {
    return db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()]);
  },

  verifyPassword(user, plainPassword) {
    return bcrypt.compareSync(plainPassword, user.password);
  },

  async listAll() {
    const rows = await db.query(`SELECT * FROM users ORDER BY createdAt DESC`);
    return rows.map(toPublic);
  },

  async updatePassword(id, newPassword) {
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.run(`UPDATE users SET password = ? WHERE id = ?`, [hash, id]);
  },

  toPublic,
};

module.exports = User;
