// =========================================================================
// index.js — Pwen antre backend la
// =========================================================================
// Sa a se fichye ki demare sèvè Express la. Li konekte tout "routes"
// (wout) yo ansanm anba yon prefiks /api/....
// =========================================================================
require('dotenv').config();
require('express-async-errors'); // pou erè nan handler async rive nan error middleware
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/admin', require('./routes/admin'));

// ---- Sèvi frontend la (an pwodiksyon) ----
// Lè nou deplwaye, nou bati frontend la (frontend/dist) epi backend la sèvi
// l dirèkteman. Konsa se YON SÈL sèvis pou deplwaye (pa de), e pa gen CORS.
// Nenpòt wout ki PA kòmanse ak /api retounen index.html pou React Router
// ka jere navigasyon an bò kliyan.
const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Jesyon erè jeneral: si yon kontwolè "throw" san l pa kaptire l,
// nou tonbe isit pou nou pa janm kite sèvè a "crash" san repons.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Yon erè sèvè rive. Eseye ankò pita.' });
});

const PORT = process.env.PORT || 4000;

// Demaraj: (1) inisyalize baz done a, (2) si SEED_ON_START=true epi baz done
// a vid, ranpli l ak done demo (itil pou premye deplwaman), (3) kòmanse koute.
async function start() {
  await db.init();

  if (process.env.SEED_ON_START === 'true') {
    try {
      const { seedIfEmpty } = require('./seed');
      await seedIfEmpty();
    } catch (err) {
      console.error('Avètisman: seed otomatik echwe:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`✅ API ap kouri sou http://localhost:${PORT} (${db.isPg ? 'PostgreSQL' : 'SQLite'})`);
  });
}

start().catch((err) => {
  console.error('Erè pandan demaraj la:', err);
  process.exit(1);
});
