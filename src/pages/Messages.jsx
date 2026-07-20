import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context.jsx';
import { Icon } from '../components/Icon.jsx';

function AvatarCircle({ name, size = 40, gradient = 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }) {
  return (
    <div
      className="flex-none flex items-center justify-center rounded-full text-white font-bold"
      style={{ width: size, height: size, background: gradient, fontSize: size * 0.4 }}
    >
      {name.charAt(0)}
    </div>
  );
}

function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="space-y-0.5">
      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-colors"
          style={{ background: activeId === conv.id ? '#e2f7f3' : 'transparent' }}
        >
          <AvatarCircle name={conv.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-cx-ink text-sm truncate">{conv.name}</p>
              <span className="text-[11px] text-cx-muted flex-none ml-2">{conv.time}</span>
            </div>
            <p className="text-xs text-cx-muted truncate mt-0.5">
              {conv.msgs.length > 0 ? conv.msgs[conv.msgs.length - 1].t : ''}
            </p>
          </div>
          {conv.unread > 0 && (
            <span
              className="flex-none w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: '#14b8a6' }}
            >
              {conv.unread}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ChatThread({ conv, chatInput, onInputChange, onSend }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.msgs]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="flex justify-center">
          <span className="text-[11px] text-cx-muted bg-cx-bg px-3 py-1 rounded-full">Today</span>
        </div>
        {conv.msgs.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} gap-2`}
          >
            {msg.from === 'them' && <AvatarCircle name={conv.name} size={30} />}
            <div
              className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.from === 'me' ? '#14b8a6' : 'white',
                color: msg.from === 'me' ? 'white' : '#1f2430',
                border: msg.from === 'them' ? '1px solid #ebedf0' : 'none',
                borderRadius: msg.from === 'me' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              }}
            >
              {msg.t}
              <div
                className="text-[10px] mt-1"
                style={{ color: msg.from === 'me' ? 'rgba(255,255,255,0.7)' : '#9aa0ab' }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-cx-border px-4 py-3 flex items-center gap-2 bg-white">
        <div className="flex-1 flex items-center bg-cx-input rounded-2xl px-4 py-2 gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-transparent outline-none border-none text-sm text-cx-ink placeholder-cx-muted"
            style={{ fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!chatInput.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer disabled:opacity-50"
          style={{ background: '#14b8a6' }}
        >
          <Icon name="send" size={18} style={{ color: 'white' }} />
        </button>
      </div>
    </div>
  );
}

export function Messages() {
  const { state, dispatch, sendChat } = useApp();
  const [chatOpen, setChatOpen] = useState(false);

  const { conversations, activeChatId, chatInput } = state;
  const activeConv = conversations.find(c => c.id === activeChatId) || conversations[0];

  function handleSelectConv(id) {
    dispatch({ type: 'OPEN_CHAT', id });
    setChatOpen(true);
  }

  function handleSend() {
    if (!chatInput.trim() || !activeConv) return;
    sendChat(activeConv.id, chatInput);
  }

  function handleInputChange(value) {
    dispatch({ type: 'SET_CHAT_INPUT', value });
  }

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        {!chatOpen ? (
          <div>
            <h1 className="text-2xl font-extrabold text-cx-ink mb-0.5">Messages</h1>
            <p className="text-sm text-cx-muted mb-4">Chats with landlords and vendors</p>
            <ConversationList
              conversations={conversations}
              activeId={activeChatId}
              onSelect={handleSelectConv}
            />
          </div>
        ) : (
          activeConv && (
            <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-3 border-b border-cx-border mb-0">
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer"
                >
                  <Icon name="arrow_back" size={20} style={{ color: '#42474f' }} />
                </button>
                <AvatarCircle name={activeConv.name} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-cx-ink text-sm">{activeConv.name}</p>
                    <Icon name="verified" size={14} fill={1} style={{ color: '#14b8a6' }} />
                  </div>
                  <p className="text-[11px] text-cx-muted">{activeConv.kind === 'lodge' ? 'Landlord' : 'Business'} · {activeConv.listing}</p>
                </div>
                <button className="w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer">
                  <Icon name="call" size={18} style={{ color: '#42474f' }} />
                </button>
              </div>
              <ChatThread
                conv={activeConv}
                chatInput={chatInput}
                onInputChange={handleInputChange}
                onSend={handleSend}
              />
            </div>
          )
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex border border-cx-border rounded-2xl overflow-hidden bg-white" style={{ height: 600 }}>
        {/* Left pane */}
        <div className="w-[340px] flex-none border-r border-cx-border flex flex-col">
          <div className="p-4 border-b border-cx-border">
            <h2 className="font-extrabold text-cx-ink mb-3">Messages</h2>
            <div className="flex items-center gap-2 bg-cx-input rounded-xl px-3 py-2">
              <Icon name="search" size={16} style={{ color: '#9aa0ab' }} />
              <input
                type="text"
                placeholder="Search chats…"
                className="flex-1 text-xs text-cx-ink placeholder-cx-muted bg-transparent outline-none border-none"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <ConversationList
              conversations={conversations}
              activeId={activeChatId}
              onSelect={id => dispatch({ type: 'OPEN_CHAT', id })}
            />
          </div>
        </div>

        {/* Right pane */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-cx-border">
              <AvatarCircle name={activeConv.name} size={38} />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-cx-ink text-sm">{activeConv.name}</p>
                  <Icon name="verified" size={14} fill={1} style={{ color: '#14b8a6' }} />
                </div>
                <p className="text-xs text-cx-muted">{activeConv.kind === 'lodge' ? 'Landlord' : 'Business'} · {activeConv.listing}</p>
              </div>
              <button className="w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer">
                <Icon name="call" size={18} style={{ color: '#42474f' }} />
              </button>
            </div>
            <ChatThread
              conv={activeConv}
              chatInput={chatInput}
              onInputChange={handleInputChange}
              onSend={handleSend}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cx-muted text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
