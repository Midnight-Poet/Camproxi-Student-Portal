import React from 'react';
import { AvatarCircle } from '../../../components/ui/AvatarCircle';
import { formatTime } from '../utils';

export function ConversationList({ chats, activeId, onSelect }) {
  return (
    <div className="space-y-1 p-2">
      {chats.map(chat => {
        const isActive = activeId === (chat.id || chat._id);
        const name = chat.agent ? `${chat.agent.firstName} ${chat.agent.lastName}` : 'Agent';
        
        // The backend returns an array of messages for preview
        const apiMessages = chat.messages || [];
        const sortedApiMessages = [...apiMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Use chat.lastMessage (from socket optimisitic update) OR the latest from the API array
        const actualLastMessage = chat.lastMessage || (sortedApiMessages.length > 0 ? sortedApiMessages[0] : null);
        
        const lastMsg = actualLastMessage?.content || 'Started a conversation';
        const time = formatTime(actualLastMessage?.createdAt || chat.updatedAt);
        
        // Calculate unread count from the messages array if not explicitly provided
        let unread = chat.unreadCount;
        if (unread === undefined) {
          unread = apiMessages.filter(m => m.senderType === 'AGENT' && !m.isRead).length;
        }

        return (
          <div
            key={chat.id || chat._id}
            onClick={() => onSelect(chat.id || chat._id)}
            className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 ${
              isActive 
                ? 'bg-white shadow-sm ring-1 ring-cx-border/50 translate-x-1' 
                : 'hover:bg-slate-50/80 hover:translate-x-0.5'
            }`}
          >
            <div className="relative">
              <AvatarCircle name={name} size={44} />
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-cx-teal rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`font-bold text-sm truncate ${isActive ? 'text-cx-ink' : 'text-slate-700'}`}>
                  {name}
                </p>
                <span className={`text-[11px] font-semibold flex-none ml-2 ${isActive ? 'text-cx-teal' : 'text-slate-400'}`}>
                  {time}
                </span>
              </div>
              <p className={`text-xs truncate ${isActive ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                {lastMsg}
              </p>
            </div>
            
            {unread > 0 && (
              <span className="flex-none w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm" style={{ background: '#14b8a6' }}>
                {unread}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
