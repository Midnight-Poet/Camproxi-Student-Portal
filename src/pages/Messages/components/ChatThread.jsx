import React, { useRef, useEffect } from 'react';
import { Icon } from '../../../components/Icon';
import { AvatarCircle } from '../../../components/ui/AvatarCircle';
import { formatTime, isSameDay, formatDemarcationDate } from '../utils';

export function ChatThread({ messages, activeConv, chatInput, onInputChange, onSend, user }) {
  const scrollContainerRef = useRef(null);

  const lastMessageId = messages.length > 0 ? (messages[messages.length - 1].id || messages[messages.length - 1]._id) : null;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lastMessageId]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const name = activeConv?.agent ? `${activeConv.agent.firstName} ${activeConv.agent.lastName}` : 'Agent';

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full bg-slate-50/50 relative">
      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 space-y-2 relative z-10 scroll-smooth">

        
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id || msg.senderId === user?._id;
          
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
          
          const showDemarcation = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
          const isNextSameSender = nextMsg && (nextMsg.senderId === msg.senderId);
          const isNextSameDay = nextMsg && isSameDay(msg.createdAt, nextMsg.createdAt);
          const isPrevSameSender = prevMsg && (prevMsg.senderId === msg.senderId) && isSameDay(msg.createdAt, prevMsg.createdAt);
          
          const showTime = !isNextSameSender || !isNextSameDay; // Only show on the last message of the block
          const showAvatar = !isMe && showTime; // Show avatar on the bottom message of the block

          // Adjust border radius for grouping
          let radiusClass = 'rounded-2xl';
          if (isMe) {
            if (isPrevSameSender && isNextSameSender && isNextSameDay) radiusClass = 'rounded-2xl rounded-tr-sm rounded-br-sm';
            else if (isPrevSameSender) radiusClass = 'rounded-2xl rounded-tr-sm';
            else if (isNextSameSender && isNextSameDay) radiusClass = 'rounded-2xl rounded-br-sm';
          } else {
            if (isPrevSameSender && isNextSameSender && isNextSameDay) radiusClass = 'rounded-2xl rounded-tl-sm rounded-bl-sm';
            else if (isPrevSameSender) radiusClass = 'rounded-2xl rounded-tl-sm';
            else if (isNextSameSender && isNextSameDay) radiusClass = 'rounded-2xl rounded-bl-sm';
          }
          
          return (
            <div key={msg.id || msg._id || i}>
              {showDemarcation && (
                <div className="flex justify-center my-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-200/50">
                    {formatDemarcationDate(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3 group items-end mb-${showTime ? '4' : '1'}`}>
                {!isMe && (
                  <div className="w-[28px] flex-none">
                    {showAvatar && <AvatarCircle name={name} size={28} />}
                  </div>
                )}
                
                <div className="flex flex-col max-w-[75%] gap-1">
                  <div
                    className={`relative px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all ${
                      isMe 
                        ? `bg-gradient-to-br from-cx-teal to-teal-600 text-white ${radiusClass}` 
                        : `bg-white text-slate-700 border border-slate-100 ${radiusClass}`
                    }`}
                  >
                    {msg.content}
                  </div>
                  {showTime && (
                    <div
                      className={`text-[10px] font-semibold px-1 flex items-center gap-1 mt-0.5 ${
                        isMe ? 'text-slate-400 justify-end' : 'text-slate-400 justify-start'
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && (
                        <Icon 
                          name="done_all" 
                          size={14} 
                          className={msg.isRead ? "text-blue-500" : "text-slate-300"} 
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Input Area */}
      <div className="px-4 py-4 bg-transparent relative  z-20 pb-6 md:pb-4 w-full">
        <div className="flex items-end gap-2 bg-white rounded-3xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
          <button className="w-10 h-10 flex-none rounded-full flex items-center justify-center text-slate-400 hover:text-cx-teal hover:bg-teal-50 transition-colors cursor-pointer border-none bg-transparent">
            <Icon name="add_circle" size={24} />
          </button>
          
          <div className="flex-1 bg-slate-50 rounded-2xl mb-1 min-h-[40px] flex items-center px-4">
            <textarea
              value={chatInput}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-transparent outline-none border-none text-sm text-slate-700 placeholder-slate-400 resize-none py-3"
              rows={1}
              style={{ fontFamily: 'inherit', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={onSend}
            disabled={!chatInput.trim()}
            className="w-11 h-11 flex-none rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all hover:scale-105 active:scale-95 shadow-md border-none mb-0.5 mr-0.5"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            <Icon name="send" size={20} style={{ color: 'white' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
