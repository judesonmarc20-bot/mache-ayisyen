// =========================================================================
// Messages.jsx — Lis konvèsasyon + fenèt chat (kliyan ak vandè)
// =========================================================================
// Chat la mache pa "polling": chak 4 segond nou mande sèvè a si gen nouvo
// mesaj. Se yon apwòch senp (san WebSocket) ki mache byen pou volim mesaj
// yon ti/mwayen mache.
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { id: activeId } = useParams();
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

  const loadConversations = useCallback(() => {
    api.get('/conversations').then((res) => setConversations(res.data.conversations));
  }, []);

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, 5000);
    return () => clearInterval(t);
  }, [loadConversations]);

  const isVendor = user?.role === 'VENDOR';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">💬 Mesaj</h1>

      <div className="grid md:grid-cols-3 gap-4 h-[70vh]">
        {/* Lis konvèsasyon */}
        <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-xl overflow-y-auto shadow-soft">
          {conversations.length === 0 ? (
            <p className="text-slate-400 text-sm p-4">Pa gen konvèsasyon ankò.</p>
          ) : (
            conversations.map((c) => (
              <Link
                key={c.id}
                to={`/messages/${c.id}`}
                className={`block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  activeId === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-sm truncate">
                    {isVendor ? c.customerName : c.storeName}
                  </span>
                  {c.unread > 0 && (
                    <span className="bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {c.unread}
                    </span>
                  )}
                </div>
                {c.lastMessage && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Fenèt chat la */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl flex flex-col shadow-soft overflow-hidden">
          {activeId ? (
            <ChatWindow conversationId={activeId} onSent={loadConversations} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Chwazi yon konvèsasyon pou wè mesaj yo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ conversationId, onSent }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const load = useCallback(() => {
    api
      .get(`/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data.messages))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Ou pa gen aksè a konvèsasyon sa a.');
        }
      });
  }, [conversationId]);

  useEffect(() => {
    setError('');
    load();
    const t = setInterval(load, 4000); // polling
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body;
    setBody('');
    try {
      await api.post(`/conversations/${conversationId}/messages`, { body: text });
      load();
      onSent?.();
    } catch {
      setBody(text); // remete tèks la si echwe
    }
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>;
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  mine
                    ? 'bg-brand-700 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-slate-100 p-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ekri yon mesaj..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          className="bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800"
        >
          Voye
        </button>
      </form>
    </>
  );
}
