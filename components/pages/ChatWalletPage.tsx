import React, { useState, useEffect, useRef } from 'react';
import { Translation, LanguageCode } from '../../translations';
import { UserState } from '../../types';
import { MessageSquare, Send, Users, ShieldCheck, UserPlus, PhoneCall, Trash2, Search, ArrowRight, Check, Globe, MessageCircle, Sparkles, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  senderChatNumber: string;
  senderName: string;
  recipientChatNumber: string;
  text: string;
  timestamp: number;
}

interface Contact {
  id: string;
  chatNumber: string;
  name: string;
  note?: string;
}

interface ServerUser {
  chatNumber: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ApiLine {
  id: string;
  name: string;
  chatNumber: string;
  apiKey: string;
  createdAt: number;
  messagesSentCount: number;
}

interface ChatWalletPageProps {
  user: UserState;
  t: Translation;
  lang: LanguageCode;
  onUpdateBalance?: (delta: number, description: string) => boolean;
}

const STORAGE_MESSAGES_KEY = 'ut_wallet_chatwallet_messages_v5';
const STORAGE_CONTACTS_KEY = 'ut_wallet_chatwallet_contacts_v4';
const STORAGE_MY_CHATNUMBER_KEY = 'ut_wallet_chatwallet_my_number_v1';
const STORAGE_API_LINES_KEY = 'ut_wallet_chatwallet_apilines_v1';

const SERVER_USERS_REGISTRY: ServerUser[] = [
  { chatNumber: '+77799123', name: 'سارا احمدی', isOnline: true },
  { chatNumber: '+77710001', name: 'آرش کیانی', isOnline: true },
  { chatNumber: '+77788456', name: 'پشتیبانی شبکه UT', isOnline: true },
  { chatNumber: '+77733211', name: 'رضا صرافی', isOnline: false, lastSeen: '۲ ساعت پیش' },
  { chatNumber: '+77755443', name: 'الناز مرادی', isOnline: true },
];

export const ChatWalletPage: React.FC<ChatWalletPageProps> = ({ user, t, lang, onUpdateBalance }) => {
  const [myChatNumber, setMyChatNumber] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MY_CHATNUMBER_KEY);
      if (saved) return saved;
      const randomFive = Math.floor(10000 + Math.random() * 90000);
      const generated = `+777${randomFive}`;
      localStorage.setItem(STORAGE_MY_CHATNUMBER_KEY, generated);
      return generated;
    } catch {
      return '+77725142';
    }
  });

  const [myName, setMyName] = useState<string>(() => {
    return user.uniqueKey ? `کاربر (${user.uniqueKey.slice(0, 8)})` : 'من (کاربر UT)';
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTACTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'c-1', chatNumber: '+77799123', name: 'سارا احمدی', note: 'دوست و همکار' },
      { id: 'c-2', chatNumber: '+77710001', name: 'آرش کیانی', note: 'سرمایه‌گذار' },
    ];
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-1',
        senderChatNumber: '+77799123',
        senderName: 'سارا احمدی',
        recipientChatNumber: '+77725142',
        text: 'سلام! شماره چت‌والت من را سیو داشته باش.',
        timestamp: Date.now() - 3600000,
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'apiline'>('messages');
  const [activeChatPeer, setActiveChatPeer] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const [apiLines, setApiLines] = useState<ApiLine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_API_LINES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'line-1',
        name: 'ربات پشتیبانی فروش',
        chatNumber: '+77788412',
        apiKey: 'ut_live_a98f7c21e3094b',
        createdAt: Date.now() - 86400000,
        messagesSentCount: 14
      }
    ];
  });

  const [newLineName, setNewLineName] = useState('');
  const [lineCreationError, setLineCreationError] = useState('');
  const [lineCreationSuccess, setLineCreationSuccess] = useState('');

  const [apiTestLine, setApiTestLine] = useState<ApiLine | null>(null);
  const [apiRecipient, setApiRecipient] = useState('');
  const [apiMessageText, setApiMessageText] = useState('');
  const [apiTestStatus, setApiTestStatus] = useState<string | null>(null);

  const [directRecipient, setDirectRecipient] = useState('');
  const [directError, setDirectError] = useState('');
  const [directSuccess, setDirectSuccess] = useState('');

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [modalChatNumber, setModalChatNumber] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalNote, setModalNote] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_MESSAGES_KEY && e.newValue) {
        try { setMessages(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_CONTACTS_KEY && e.newValue) {
        try { setContacts(JSON.parse(e.newValue)); } catch {}
      }
    };
    const handleCustomSync = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) setMessages(ce.detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('chatwallet_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('chatwallet_sync', handleCustomSync);
    };
  }, []);

  const saveAndBroadcastMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(newMessages));
      window.dispatchEvent(new CustomEvent('chatwallet_sync', { detail: newMessages }));
    } catch {}
  };

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem(STORAGE_CONTACTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatPeer]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatPeer) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      senderChatNumber: myChatNumber,
      senderName: myName,
      recipientChatNumber: activeChatPeer,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    saveAndBroadcastMessages([...messages, newMsg]);
    setInputText('');
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_API_LINES_KEY, JSON.stringify(apiLines));
    } catch {}
  }, [apiLines]);

  const handleCreateApiLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineName.trim()) return;

    setLineCreationError('');
    setLineCreationSuccess('');

    if (onUpdateBalance) {
      const success = onUpdateBalance(-100, `هزینه ایجاد خط API چت‌والت (${newLineName.trim()})`);
      if (!success) {
        setLineCreationError('موجودی UT کافی نیست! ایجاد خط نیاز به ۱۰۰ UT دارد.');
        return;
      }
    }

    const randomFive = Math.floor(10000 + Math.random() * 90000);
    const newChatNum = `+777${randomFive}`;
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newApiKey = `ut_live_${randomHex}`;

    const newLine: ApiLine = {
      id: `line-${Date.now()}`,
      name: newLineName.trim(),
      chatNumber: newChatNum,
      apiKey: newApiKey,
      createdAt: Date.now(),
      messagesSentCount: 0
    };

    setApiLines(prev => [newLine, ...prev]);
    setNewLineName('');
    setLineCreationSuccess(`خط «${newLine.name}» با موفقیت ایجاد شد! (۱۰۰ UT کسر گردید).`);
    setTimeout(() => setLineCreationSuccess(''), 5000);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directRecipient.trim()) return;

    setDirectError('');
    setDirectSuccess('');

    let formatted = directRecipient.trim();
    if (!formatted.startsWith('+777')) {
      if (formatted.startsWith('777')) formatted = '+' + formatted;
      else formatted = '+777' + formatted.replace(/\D/g, '').slice(-5);
    }

    const foundInServer = SERVER_USERS_REGISTRY.find(u => u.chatNumber === formatted);
    const foundInContacts = contacts.find(c => c.chatNumber === formatted);
    const foundInApiLines = apiLines.find(l => l.chatNumber === formatted);
    const isSelf = formatted === myChatNumber;

    if (!foundInServer && !foundInContacts && !foundInApiLines && !isSelf) {
      setDirectError('شماره وارد شده معتبر نیست یا در سرور وجود ندارد.');
      return;
    }

    setDirectSuccess('شماره تأیید شد! در حال انتقال به صفحه چت...');
    setDirectRecipient('');
    setTimeout(() => {
      setDirectSuccess('');
      setActiveChatPeer(formatted);
    }, 600);
  };

  const handleDeleteApiLine = (lineId: string) => {
    setApiLines(prev => prev.filter(l => l.id !== lineId));
    if (apiTestLine?.id === lineId) {
      setApiTestLine(null);
    }
  };

  const handleSendApiMessage = (line: ApiLine, recipient: string, text: string) => {
    if (!recipient.trim() || !text.trim()) return;

    if (onUpdateBalance) {
      const success = onUpdateBalance(-0.01, `ارسال پیام خودکار API (${line.name})`);
      if (!success) {
        setApiTestStatus('خطا: موجودی UT کافی نیست (نیاز به 0.01 UT برای هر ارسال).');
        return;
      }
    }

    let formattedRecipient = recipient.trim();
    if (!formattedRecipient.startsWith('+777')) {
      if (formattedRecipient.startsWith('777')) formattedRecipient = '+' + formattedRecipient;
      else formattedRecipient = '+777' + formattedRecipient.replace(/\D/g, '').slice(-5);
    }

    const newMsg: ChatMessage = {
      id: `msg-api-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderChatNumber: line.chatNumber,
      senderName: `${line.name} (API)`,
      recipientChatNumber: formattedRecipient,
      text: text.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(updatedMessages));
      window.dispatchEvent(new CustomEvent('chatwallet_sync', { detail: updatedMessages }));
    } catch {}

    setApiLines(prev => prev.map(l => l.id === line.id ? { ...l, messagesSentCount: l.messagesSentCount + 1 } : l));

    setApiTestStatus('پیام با موفقیت از طریق API ارسال شد (۰.۰۱ UT کسر گردید).');
    setApiMessageText('');
    setApiRecipient('');
    setTimeout(() => setApiTestStatus(null), 4000);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalChatNumber.trim() || !modalName.trim()) return;

    let formatted = modalChatNumber.trim();
    if (!formatted.startsWith('+777')) {
      if (formatted.startsWith('777')) formatted = '+' + formatted;
      else formatted = '+777' + formatted.replace(/\D/g, '').slice(-5);
    }

    const newC: Contact = {
      id: 'c-' + Date.now(),
      chatNumber: formatted,
      name: modalName.trim(),
      note: modalNote.trim() || undefined,
    };

    const filtered = contacts.filter(c => c.chatNumber !== formatted);
    saveContacts([...filtered, newC]);
    setModalChatNumber('');
    setModalName('');
    setModalNote('');
    setIsAddContactModalOpen(false);
  };

  const handleDeleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveContacts(contacts.filter(c => c.id !== id));
  };

  const activeChatsMap = new Map<string, { chatNumber: string; name: string; lastMessage: string; timestamp: number }>();
  
  messages.forEach(m => {
    const peer = m.senderChatNumber === myChatNumber ? m.recipientChatNumber : m.senderChatNumber;
    if (peer && peer !== myChatNumber) {
      const existingContact = contacts.find(c => c.chatNumber === peer);
      const serverReg = SERVER_USERS_REGISTRY.find(u => u.chatNumber === peer);
      const peerName = existingContact?.name || serverReg?.name || `کاربر (${peer.slice(-4)})`;

      const existing = activeChatsMap.get(peer);
      if (!existing || m.timestamp > existing.timestamp) {
        activeChatsMap.set(peer, {
          chatNumber: peer,
          name: peerName,
          lastMessage: m.text,
          timestamp: m.timestamp,
        });
      }
    }
  });

  contacts.forEach(c => {
    if (!activeChatsMap.has(c.chatNumber)) {
      activeChatsMap.set(c.chatNumber, {
        chatNumber: c.chatNumber,
        name: c.name,
        lastMessage: 'شروع گفتگو...',
        timestamp: 0,
      });
    }
  });

  const chatList = Array.from(activeChatsMap.values()).sort((a, b) => b.timestamp - a.timestamp);

  const currentChatMessages = activeChatPeer
    ? messages.filter(m => (m.senderChatNumber === myChatNumber && m.recipientChatNumber === activeChatPeer) || (m.senderChatNumber === activeChatPeer && m.recipientChatNumber === myChatNumber))
    : [];

  const activePeerContact = contacts.find(c => c.chatNumber === activeChatPeer);
  const activePeerServer = SERVER_USERS_REGISTRY.find(u => u.chatNumber === activeChatPeer);
  const activePeerName = activePeerContact?.name || activePeerServer?.name || (activeChatPeer ? `کاربر (${activeChatPeer.slice(-4)})` : '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-4 pb-20 px-2 sm:px-4 w-full box-border"
    >
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>چت‌والت امن</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">P2P</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">پیام‌رسان همتابه‌همتا با شماره یکتای +777</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 block font-medium">شماره شما:</span>
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-300 tracking-wider" dir="ltr">{myChatNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram-style 3 Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/80 grid grid-cols-3 gap-1">
        <button
          onClick={() => { setActiveTab('messages'); setActiveChatPeer(null); }}
          className={`py-2 px-1 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">پیام‌ها ({chatList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('contacts'); setActiveChatPeer(null); }}
          className={`py-2 px-1 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">مخاطبین ({contacts.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('apiline'); setActiveChatPeer(null); }}
          className={`py-2 px-1 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'apiline'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="truncate">خطوط API</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        {activeChatPeer ? (
          /* Active Chat View */
          <div className="flex flex-col h-[500px] sm:h-[540px]">
            {/* Chat Header */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-3 sm:px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setActiveChatPeer(null)}
                  className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="بازگشت"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                  {activePeerName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm truncate">{activePeerName}</h3>
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 font-bold block" dir="ltr">{activeChatPeer}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!contacts.some(c => c.chatNumber === activeChatPeer) && (
                  <button
                    onClick={() => {
                      setModalChatNumber(activeChatPeer);
                      setModalName(activePeerName);
                      setIsAddContactModalOpen(true);
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer border border-emerald-200"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ذخیره مخاطب</span>
                    <span className="sm:hidden">ذخیره</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/40">
              {currentChatMessages.map(msg => {
                const isMe = msg.senderChatNumber === myChatNumber;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-600">{msg.senderName}</span>
                      <span className="text-[9px] font-mono text-slate-400" dir="ltr">{timeStr}</span>
                    </div>

                    <div className={`max-w-[90%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm shadow-2xs ${
                      isMe 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}

              {currentChatMessages.length === 0 && (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <MessageSquare className="w-9 h-9 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">هیچ پیامی رد و بدل نشده است. اولین پیام را ارسال کنید.</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3.5 bg-white border-t border-slate-200 flex items-end gap-2">
              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) handleSendMessage(e);
                  }
                }}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium resize-none max-h-28 min-h-[42px]"
              />

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer h-[42px]"
              >
                <span>ارسال</span>
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              </motion.button>
            </form>
          </div>
        ) : (
          /* Tab Contents */
          <div className="p-3.5 sm:p-5 flex-1 flex flex-col">
            
            {/* TAB 1: MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-4 flex-1">
                {/* Start Chat By Number Form */}
                <form onSubmit={handleSendDirectMessage} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>شروع گفتگو با شماره (بدون نیاز به ذخیره مخاطب)</span>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={directRecipient}
                      onChange={(e) => setDirectRecipient(e.target.value)}
                      placeholder="شماره مقصد (مثلاً +77799123)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      disabled={!directRecipient.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-4 h-4 rtl:rotate-180" />
                      <span>شروع گفتگو</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    * شماره قبل از ورود به صفحه چت از نظر وجود در سرور بررسی می‌شود.
                  </div>

                  {directError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-bold">
                      {directError}
                    </div>
                  )}

                  {directSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs font-bold">
                      {directSuccess}
                    </div>
                  )}
                </form>

                <div className="flex justify-between items-center pb-2 border-b border-slate-100 pt-2">
                  <h2 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>لیست گفتگوهای فعال</span>
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{chatList.length} گفتگو</span>
                </div>

                <div className="space-y-2">
                  {chatList.map(chat => (
                    <div
                      key={chat.chatNumber}
                      onClick={() => setActiveChatPeer(chat.chatNumber)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          {chat.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{chat.name}</h4>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold" dir="ltr">{chat.chatNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1.5 rounded-lg transition-all shadow-2xs shrink-0">
                        باز کردن
                      </span>
                    </div>
                  ))}

                  {chatList.length === 0 && (
                    <div className="text-center py-14 text-slate-400 space-y-2">
                      <MessageSquare className="w-9 h-9 mx-auto text-slate-300" />
                      <p className="text-xs font-bold">هنوز هیچ گفتگویی ندارید.</p>
                      <p className="text-[11px]">از طریق «جستجوی سرور» یا «مخاطبین» گفتگو را شروع کنید.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-3.5 flex-1">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h2 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>دفترچه مخاطبین</span>
                  </h2>
                  <button
                    onClick={() => {
                      setModalChatNumber('');
                      setModalName('');
                      setModalNote('');
                      setIsAddContactModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {contacts.map(contact => (
                    <div 
                      key={contact.id}
                      className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/40 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          {contact.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{contact.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 block mt-0.5 truncate" dir="ltr">{contact.chatNumber}</span>
                          {contact.note && <span className="text-[9px] text-slate-400 block truncate">{contact.note}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setActiveChatPeer(contact.chatNumber)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          پیام
                        </button>
                        <button
                          onClick={(e) => handleDeleteContact(contact.id, e)}
                          title="حذف مخاطب"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {contacts.length === 0 && (
                  <div className="text-center py-14 text-slate-400 space-y-2">
                    <Users className="w-9 h-9 mx-auto text-slate-300" />
                    <p className="text-xs font-bold">مخاطبی ثبت نشده است.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: API LINES & CREATION */}
            {activeTab === 'apiline' && (
              <div className="space-y-4 py-2 flex-1 w-full">
                <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-start w-full">
                    <h2 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>سیستم ایجاد خط و ارسال خودکار API</span>
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      هر خط جدید شامل شماره اختصاصی +777 و یک کلید API امن است. هزینه ایجاد خط <span className="font-bold text-emerald-700">۱۰۰ UT</span> و ارسال هر پیام خودکار <span className="font-bold text-emerald-700">0.01 UT</span> می‌باشد که به طور خودکار از کیف پول UT شما کسر می‌گردد.
                    </p>
                  </div>
                </div>

                {/* Create Line Form */}
                <form onSubmit={handleCreateApiLine} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">ایجاد خط جدید</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newLineName}
                      onChange={(e) => setNewLineName(e.target.value)}
                      placeholder="نام دلخواه خط (مثلاً ربات فروشگاه، پشتیبانی...)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!newLineName.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>ایجاد خط (۱۰۰ UT)</span>
                    </button>
                  </div>

                  {lineCreationError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-rose-700 text-xs font-bold">
                      {lineCreationError}
                    </div>
                  )}

                  {lineCreationSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 text-xs font-bold">
                      {lineCreationSuccess}
                    </div>
                  )}
                </form>

                {/* API Test Status Feedback */}
                {apiTestStatus && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-xs font-bold text-center">
                    {apiTestStatus}
                  </div>
                )}

                {/* List of Created Lines */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span>خطوط فعال شما ({apiLines.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {apiLines.map(line => (
                      <div key={line.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 text-xs sm:text-sm">{line.name}</h4>
                              <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200" dir="ltr">
                                {line.chatNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              پیام‌های ارسالی از API: <strong className="text-slate-700">{line.messagesSentCount}</strong> پیام
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(line.apiKey);
                                alert('کلید API کپی شد!');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              title="کپی API Key"
                            >
                              <span>کپی API Key</span>
                            </button>
                            <button
                              onClick={() => handleDeleteApiLine(line.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-all cursor-pointer border border-rose-200"
                              title="حذف خط"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setApiTestLine(apiTestLine?.id === line.id ? null : line)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                              <span>{apiTestLine?.id === line.id ? 'بستن آزمایش' : 'تست ارسال API'}</span>
                            </button>
                          </div>
                        </div>

                        {/* API Test Sender Form */}
                        {apiTestLine?.id === line.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 pt-3"
                          >
                            <div className="text-[11px] text-slate-600 font-bold">
                              آزمایش ارسال خودکار پیام از طریق API (هزینه هر ارسال: <span className="text-emerald-700">0.01 UT</span>):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={apiRecipient}
                                onChange={(e) => setApiRecipient(e.target.value)}
                                placeholder="شماره گیرنده (مثلاً +77799123)"
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                dir="ltr"
                              />
                              <input
                                type="text"
                                value={apiMessageText}
                                onChange={(e) => setApiMessageText(e.target.value)}
                                placeholder="متن پیام خودکار..."
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSendApiMessage(line, apiRecipient, apiMessageText)}
                                disabled={!apiRecipient.trim() || !apiMessageText.trim()}
                                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>ارسال از طریق API (کسر 0.01 UT)</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {apiLines.length === 0 && (
                      <div className="text-center py-10 text-slate-400 space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-bold">هنوز هیچ خط API ایجاد نکرده‌اید.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddContactModalOpen(false)}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white w-full max-w-sm rounded-2xl p-4 sm:p-5 shadow-2xl border-t-4 border-emerald-500 z-10"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>ذخیره مخاطب جدید</span>
              </h3>
              <button 
                onClick={() => setIsAddContactModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره چت‌والت (+777)</label>
                <input
                  type="text"
                  value={modalChatNumber}
                  onChange={(e) => setModalChatNumber(e.target.value)}
                  placeholder="+777XXXXX"
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">نام یا عنوان مخاطب</label>
                <input
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">یادداشت (اختیاری)</label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="مثال: همکار / دوست"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition-all"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
