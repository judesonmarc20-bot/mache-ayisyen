// =========================================================================
// auth.js — Middleware pou pwoteje wout yo
// =========================================================================
// "requireAuth": egzije yon jeton JWT valid nan header "Authorization: Bearer <token>".
// "requireRole": egzije yon wòl espesifik (ADMIN, VENDOR, elatriye) anplis.
// =========================================================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Ou dwe konekte pou aksede resous sa a.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Itilizatè a pa egziste ankò.' });
    req.user = User.toPublic(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Jeton envalid oswa ekspire.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ou pa gen dwa fè aksyon sa a.' });
    }
    next();
  };
}

// "optionalAuth": si gen yon jeton valid, li ranpli req.user; sinon li kite
// req.user vid men LI PA bloke demand lan. Itil pou wout piblik ki ka bay
// enfòmasyon anplis lè itilizatè a konekte (egz. "èske ou ka bay review").
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user) req.user = User.toPublic(user);
    } catch {
      // jeton envalid -> nou jis inyore l (rete anonim)
    }
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };
