const { Conversation, Message } = require('../models/Conversation');
const Store = require('../models/Store');

// Verifye si itilizatè konekte a gen dwa wè yon konvèsasyon.
async function canAccess(user, conv) {
  if (!conv) return false;
  if (user.id === conv.customerId) return true;
  if (user.role === 'VENDOR') {
    const store = await Store.findByOwnerId(user.id);
    if (store && store.id === conv.storeId) return true;
  }
  if (user.role === 'ADMIN') return true;
  return false;
}

exports.list = async (req, res) => {
  if (req.user.role === 'VENDOR') {
    const store = await Store.findByOwnerId(req.user.id);
    return res.json({
      conversations: store ? await Conversation.listForStore(store.id, req.user.id) : [],
    });
  }
  res.json({ conversations: await Conversation.listForCustomer(req.user.id) });
};

exports.start = async (req, res) => {
  const { storeId } = req.body;
  const store = await Store.findById(storeId);
  if (!store) return res.status(404).json({ error: 'Magazen pa jwenn.' });
  if (store.ownerId === req.user.id) {
    return res.status(400).json({ error: 'Ou pa ka voye mesaj bay pwòp magazen ou.' });
  }
  const conv = await Conversation.getOrCreate(req.user.id, storeId);
  res.status(201).json({ conversation: conv });
};

exports.messages = async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!(await canAccess(req.user, conv))) {
    return res.status(403).json({ error: 'Ou pa gen aksè a konvèsasyon sa a.' });
  }
  await Message.markRead(conv.id, req.user.id);
  res.json({ messages: await Message.list(conv.id) });
};

exports.send = async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!(await canAccess(req.user, conv))) {
    return res.status(403).json({ error: 'Ou pa gen aksè a konvèsasyon sa a.' });
  }
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Mesaj vid.' });
  const message = await Message.create({
    conversationId: conv.id,
    senderId: req.user.id,
    body: body.trim(),
  });
  res.status(201).json({ message });
};
