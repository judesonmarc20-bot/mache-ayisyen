const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

exports.register = async (req, res) => {
  const { email, password, name, role, storeName } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, modpas ak non obligatwa.' });
  }
  if (await User.findByEmail(email)) {
    return res.status(409).json({ error: 'Yon kont deja egziste ak email sa a.' });
  }

  // Sèl wòl yon moun ka chwazi lè l enskri se CUSTOMER oswa VENDOR.
  const finalRole = role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER';
  const user = await User.create({ email, password, name, role: finalRole });

  if (finalRole === 'VENDOR') {
    await Store.create({
      name: storeName || `Magazen ${name}`,
      description: '',
      ownerId: user.id,
    });
  }

  const token = signToken(user);
  res.status(201).json({ user, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = email && (await User.findByEmail(email));
  if (!user || !User.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Email oswa modpas pa kòrèk.' });
  }
  const token = signToken(user);
  res.json({ user: User.toPublic(user), token });
};

exports.me = async (req, res) => {
  const store = req.user.role === 'VENDOR' ? await Store.findByOwnerId(req.user.id) : null;
  res.json({ user: req.user, store });
};
