import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context';
import { Icon } from '../../components/Icon';
import { AvatarCircle } from '../../components/ui/AvatarCircle';
import { ReportModal } from '../../components/ReportModal';
import { 
  useGetChatsQuery, 
  useGetChatMessagesQuery,
  useMarkChatReadMutation,
  useInitiateChatMutation,
  useDeleteChatMutation,
  useGetMeQuery
} from '../../store/apiSlice';
import { useChatSocket } from '../../hooks/useChatSocket';

export function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();
  const { data: user } = useGetMeQuery();
  
  // Extract query params for routing specifically to a chat or creating a new one
  const params = new URLSearchParams(location.search);
  const initialChatId = params.get('chatId');
  const isNewChat = params.get('newChat') === 'true';
  const newAgentId = params.get('agentId');
  const newAgentName = params.get('name');
  const newAgentAvatar = params.get('avatar');

  const [isHeaderMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [openMessageDropdown, setOpenMessageDropdown] = useState(null);

  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all chats — transformResponse in chatApi normalizes to a flat array
  const { data: rawChats = [], isLoading: isLoadingChats } = useGetChatsQuery();
  
  // Derive optimistic chat list synchronously from rawChats (useMemo, not useEffect+useState)
  // This ensures the sidebar re-renders IMMEDIATELY when RTK cache is updated by the socket
  const optimisticChats = React.useMemo(() => {
    let combined = [...rawChats];
    
    // Sort chats by last activity — use lastMessage computed in transformResponse
    combined.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
      
      const aTimeMs = new Date(aTime || 0).getTime();
      const bTimeMs = new Date(bTime || 0).getTime();
      
      return bTimeMs - aTimeMs;
    });

    if (isNewChat && newAgentId) {
      const exists = combined.find(c => c.agent?.id === newAgentId || c.agent?._id === newAgentId);
      if (!exists) {
        // Create a temporary optimistic chat in the list
        combined.unshift({
          id: 'temp-' + newAgentId,
          isOptimistic: true,
          agent: {
            id: newAgentId,
            firstName: newAgentName?.split(' ')[0] || 'Agent',
            lastName: newAgentName?.split(' ')[1] || '',
            profileImage: { url: newAgentAvatar },
          },
          messages: [],
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return combined;
  }, [rawChats, isNewChat, newAgentId, newAgentName, newAgentAvatar]);

  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return optimisticChats;
    const q = searchQuery.toLowerCase().trim();
    return optimisticChats.filter(chat => {
      const agentName = `${chat.agent?.firstName || ''} ${chat.agent?.lastName || ''}`.toLowerCase();
      const companyName = (chat.agent?.companyName || '').toLowerCase();
      const lastMsgContent = (chat.lastMessage?.content || '').toLowerCase();
      return agentName.includes(q) || companyName.includes(q) || lastMsgContent.includes(q);
    });
  }, [optimisticChats, searchQuery]);

  // Handle auto-selecting the active chat for new chat flows (side effect)
  useEffect(() => {
    if (isNewChat && newAgentId && !activeChatId) {
      const exists = rawChats.find(c => c.agent?.id === newAgentId || c.agent?._id === newAgentId);
      if (exists) {
        setActiveChatId(exists.id || exists._id);
      } else {
        setActiveChatId('temp-' + newAgentId);
      }
    }
  }, [isNewChat, newAgentId, rawChats, activeChatId]);

  const activeChat = optimisticChats.find(c => (c.id || c._id) === activeChatId);
  const isTempChat = activeChat?.isOptimistic;

  // Real-time socket integration
  // Wait to hook up socket if it's a temporary chat until we actually create it.
  const socketChatId = isTempChat ? null : activeChatId;
  const { sendMessage, deleteMessage: socketDeleteMessage } = useChatSocket(socketChatId);

  // Fetch messages for active chat
  const { data: messagesRes, isLoading: isLoadingMessages } = useGetChatMessagesQuery(
    { chatId: activeChatId, limit: 50, skip: 0 },
    { skip: !activeChatId || isTempChat }
  );
  const rawMessages = Array.isArray(messagesRes) ? messagesRes : (messagesRes?.data || []);
  
  const [initiateChat] = useInitiateChatMutation();
  const [markChatRead] = useMarkChatReadMutation();

  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 80);
    return () => clearTimeout(timer);
  }, [rawMessages, activeChatId]);

  // Mark chat read when opened
  useEffect(() => {
    if (activeChatId && !isTempChat) {
      markChatRead(activeChatId).catch(() => {});
    }
  }, [activeChatId, isTempChat, markChatRead]);

  // Helper to format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDemarcation = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    
    // Normalize to midnight
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffDays = Math.round((nowDay - dDay) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return d.toLocaleDateString('en-US'); // e.g. 1/3/2024
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Wait! To keep it simple, we assume if it's a new chat, the frontend API slice has an `initiateChat` mutation we should call first.
    // For now, we will just use the socket for existing chats.
    // Let's implement the temporary chat upgrade logic inline:
    if (isTempChat) {
      showToast('Creating chat...', { position: 'top' });
      try {
        const result = await initiateChat({ agentId: newAgentId }).unwrap();
        const newRealChatId = result.id || result._id;
        
        // Now that the chat is created, send the first message via socket
        const payload = {
          chatId: newRealChatId,
          senderId: user?.id || user?._id,
          senderType: 'STUDENT',
          content: chatInput,
        };
		console.log(payload)

        // Also update local state so the URL / activeChatId updates
        setActiveChatId(newRealChatId);
        
        // Optional: you can strip the query params to avoid re-triggering new chat flow
        navigate(`/messages?chatId=${newRealChatId}`, { replace: true });
        
        // Make sure the socket instance is available, usually useChatSocket watches the activeChatId
        // The message will be sent once the new socket initializes for this chat, or we can just POST the first message via API if there was a route for it.
        // Assuming `sendMessage` won't work immediately if the hook is still initializing. 
        // We will just let `handleSend` run again with the real ID, or send immediately if the namespace connects.
        // Let's send immediately:
        sendMessage(payload);
        setChatInput('');

      } catch (error) {
        showToast('Failed to start chat');
      }
      return; 
    }

    const payload = {
      chatId: activeChatId,
      senderId: user?.id || user?._id,
      senderType: 'STUDENT',
      content: chatInput,
    };

    sendMessage(payload);
    setChatInput('');
  };

  const [deleteChatApi] = useDeleteChatMutation();

  const handleDeleteChat = async () => {
    if (!activeChatId) return;
    if (activeChatId.startsWith('temp-')) {
      setActiveChatId(null);
      showToast('Chat deleted');
      return;
    }
    try {
      await deleteChatApi(activeChatId).unwrap();
      showToast('Chat deleted');
      setActiveChatId(null);
    } catch {
      showToast('Failed to delete chat');
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!activeChatId) return;
    socketDeleteMessage({ chatId: activeChatId, messageId });
    showToast('Message deleted');
    setOpenMessageDropdown(null);
  };

  const chronologicalMessages = rawMessages.slice().reverse();

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden font-sans h-[calc(100vh-120px)] md:h-[calc(100vh-132px)]">
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar / Conversation List */}
        <div className={`w-full md:w-[350px] lg:w-[400px] flex-none flex flex-col bg-white border-r border-slate-100 transition-transform ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center gap-3 p-4 md:p-6 pb-2 border-b border-transparent">
            <button 
              onClick={() => navigate(-1)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border-none cursor-pointer"
            >
              <Icon name="arrow_back" size={20} className="text-slate-700" />
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900">Messages</h1>
          </div>

          <div className="p-4 pt-2 md:pt-4">
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cx-teal/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingChats ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 items-center animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-slate-100"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-cx-teal/10 flex items-center justify-center mb-4">
                  <Icon name="chat" size={28} className="text-cx-teal" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">
                  {searchQuery ? 'No matching messages' : 'No messages yet'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {searchQuery ? 'Try a different search term.' : 'When you contact an agent, your chats will appear here.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredChats.map(chat => {
                  const chatId = chat.id || chat._id;
                  const agentName = `${chat.agent?.firstName || 'Agent'} ${chat.agent?.lastName || ''}`.trim();
                  const avatarUrl = chat.agent?.profileImage?.url;
                  const isActive = String(chatId) === String(activeChatId);
                  
                  // For the active chat, rawMessages[0] is guaranteed to be the freshest message in memory
                  const activeLatestMsg = isActive && rawMessages && rawMessages.length > 0 ? rawMessages[0] : null;
                  const lastMsg = activeLatestMsg || chat.lastMessage || (chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null);
                  
                  const isUserSender = lastMsg && (
                    lastMsg.senderType?.toUpperCase() === 'STUDENT' || 
                    (user && String(lastMsg.senderId) === String(user.id || user._id))
                  );

                  const unreadCount = chat.unreadCount !== undefined 
                    ? chat.unreadCount 
                    : (chat.messages || []).filter(m => m.senderType === 'AGENT' && !m.isRead).length;
                  const unread = unreadCount > 0;
                  const displayTime = lastMsg?.createdAt || chat.updatedAt || chat.createdAt;
                  
                  return (
                    <div 
                      key={chatId}
                      onClick={() => setActiveChatId(chatId)}
                      className={`group mx-4 my-2 px-4 py-3.5 cursor-pointer transition-all duration-300 rounded-2xl border active:scale-[0.985] flex gap-3.5 relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-br from-[#14b8a6]/[0.06] to-[#7c6cf0]/[0.03] border-[#14b8a6]/25 shadow-[0_10px_30px_-5px_rgba(20,184,166,0.08)]' 
                          : 'bg-white hover:bg-slate-50/50 border-slate-100 hover:border-slate-200/80 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-gradient-to-b from-[#14b8a6] to-[#7c6cf0] rounded-r-full" />
                      )}

                      <div className="relative flex-none">
                        <AvatarCircle name={agentName} imageUrl={avatarUrl} size={50} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className={`text-sm truncate pr-2 transition-colors ${
                            unread 
                              ? 'font-extrabold text-slate-900 group-hover:text-cx-teal' 
                              : 'font-bold text-slate-700 group-hover:text-slate-900'
                          }`}>
                            {agentName}
                          </h4>
                          <span className={`text-[10px] whitespace-nowrap font-bold ${unread ? 'text-[#14b8a6]' : 'text-slate-400'}`}>
                            {displayTime ? formatTime(displayTime) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-[12.5px] truncate pr-2 ${unread ? 'font-bold text-slate-800' : 'text-slate-400 font-medium'}`}>
                            {lastMsg ? (
                              <>
                                {isUserSender && <span className="opacity-75 font-semibold mr-1">You:</span>}
                                <span>{lastMsg.content}</span>
                              </>
                            ) : (
                              chat.isOptimistic ? 'New Conversation' : 'Start a conversation'
                            )}
                          </p>
                          {unread && (
                            <div className="min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-[#ff5e62] to-[#ff9966] rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-[0_4px_10px_rgba(255,94,98,0.3)] flex-none">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#f8fafc] md:flex relative ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-white/50 m-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-cx-teal/10 flex items-center justify-center mb-6">
                <Icon name="forum" size={48} className="text-cx-teal" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Messages</h2>
              <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar or start a new chat with an agent to get started.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex-none flex items-center justify-between p-4 px-4 md:px-6 bg-white/80 backdrop-blur-lg border-b border-slate-100 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-none cursor-pointer -ml-2"
                  >
                    <Icon name="arrow_back" size={20} className="text-slate-700" />
                  </button>
                  <AvatarCircle 
                    name={`${activeChat.agent?.firstName || ''} ${activeChat.agent?.lastName || ''}`} 
                    imageUrl={activeChat.agent?.profileImage?.url} 
                    size={44} 
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">
                      {activeChat.agent?.firstName} {activeChat.agent?.lastName}
                    </h3>
                    <p className="text-[12px] text-gray-500 font-semibold flex items-center gap-1">
                      {/* <span className="w-1.5 h-1.5 rounded-full bg-cx-teal"></span> */}
                      {activeChat.agent?.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setHeaderMenuOpen(!isHeaderMenuOpen)}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-none cursor-pointer transition-colors text-slate-500"
                    >
                      <Icon name="more_vert" size={20} />
                    </button>
                    
                    {isHeaderMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                        <button 
                          onClick={() => { setHeaderMenuOpen(false); setActiveChatId(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Icon name="close" size={18} /> Close chat
                        </button>
                        <button 
                          onClick={() => { setHeaderMenuOpen(false); navigate(`/agent/${activeChat.agent?.id || activeChat.agent?._id}`); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Icon name="person" size={18} /> View profile
                        </button>
                        <button 
                          onClick={() => { setHeaderMenuOpen(false); setReportModalOpen(true); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Icon name="flag" size={18} /> Report user
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => { setHeaderMenuOpen(false); handleDeleteChat(); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Icon name="delete" size={18} /> Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {isLoadingMessages ? (
                  <div className="flex flex-col gap-4">
                    <div className="self-end w-2/3 h-12 bg-cx-teal/10 rounded-2xl rounded-tr-sm animate-pulse"></div>
                    <div className="self-start w-1/2 h-16 bg-slate-200/50 rounded-2xl rounded-tl-sm animate-pulse"></div>
                  </div>
                ) : rawMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <p className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-semibold">Say hello!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {chronologicalMessages.map((msg, i) => {
                      const isMe = msg.senderType === 'STUDENT';
                      
                      // Demarcation Logic
                      const prevMsg = chronologicalMessages[i - 1];
                      const currentDemarcation = formatDateDemarcation(msg.createdAt);
                      const prevDemarcation = prevMsg ? formatDateDemarcation(prevMsg.createdAt) : null;
                      const showDemarcation = currentDemarcation !== prevDemarcation;

                      // Grouping Logic (show time only on last message of a sequence)
                      const nextMsg = chronologicalMessages[i + 1];
                      let isLastInGroup = true;
                      
                      if (nextMsg && (nextMsg.senderId === msg.senderId || nextMsg.senderType === msg.senderType)) {
                        isLastInGroup = false;
                      }

                      return (
                        <React.Fragment key={msg.id || msg._id || i}>
                          {showDemarcation && (
                            <div className="flex justify-center my-2">
                              <span className="bg-slate-100/80 text-slate-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {currentDemarcation}
                              </span>
                            </div>
                          )}
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn group ${!isLastInGroup ? 'mb-[-8px]' : ''}`}>
                          <div className={`flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div 
                              className={`py-3 pl-4 pr-9 rounded-2xl text-[15px] leading-relaxed shadow-sm relative ${
                                isMe 
                                  ? 'bg-gradient-to-br from-[#14b8a6] to-[#0c8c81] text-white rounded-br-sm' 
                                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                              }`}
                            >
                              {msg.content}
                              
                              {/* Read marker inside bubble */}
                              {isMe && (
                                <div className="absolute bottom-1.5 right-2 opacity-90" title={msg.isRead ? 'Read' : 'Delivered'}>
                                  <Icon 
                                    name={msg.isRead ? "done_all" : "check"} 
                                    size={15} 
                                    className={msg.isRead ? "text-cyan-200" : "text-white/80"} 
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Hover Chevron & Dropdown - ONLY FOR MY MESSAGES */}
                            {isMe && (
                              <div className="relative">
                                <button 
                                  onClick={() => setOpenMessageDropdown(openMessageDropdown === (msg.id || msg._id) ? null : (msg.id || msg._id))}
                                  className={`p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer border-none bg-transparent transition-all ${openMessageDropdown === (msg.id || msg._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                  title="More options"
                                >
                                  <Icon name="expand_more" size={20} />
                                </button>

                                {openMessageDropdown === (msg.id || msg._id) && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={() => setOpenMessageDropdown(null)} 
                                    />
                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 z-20">
                                      <button 
                                        onClick={() => handleDeleteMessage(msg.id || msg._id)}
                                        className="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent relative z-30"
                                      >
                                        <Icon name="delete" size={16} /> Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Only show timestamp if it's the last in the group */}
                          {isLastInGroup && (
                            <div className="flex items-center gap-1 mt-1.5 px-1">
                              <span className="text-[11px] font-medium text-slate-400">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Redesigned Floating Pill Input Bar */}
              <div className="flex-none p-3.5 md:p-4 bg-white/95 backdrop-blur-md border-t border-slate-100/80 shadow-[0_-4px_24px_rgba(0,0,0,0.03)]">
                <form 
                  onSubmit={handleSend}
                  className="flex items-center gap-3 bg-slate-100/90 focus-within:bg-white border border-slate-200/80 p-2 pl-5 rounded-full focus-within:border-cx-teal focus-within:ring-4 focus-within:ring-cx-teal/10 shadow-sm transition-all max-w-4xl mx-auto"
                >
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent border-none text-[15px] font-medium text-slate-800 placeholder-slate-400 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim()}
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-none cursor-pointer border-none shadow-md bg-gradient-to-r from-cx-teal to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white disabled:opacity-40 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <Icon name="send" size={19} className={chatInput.trim() ? "translate-x-0.5" : ""} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="AGENT"
        targetId={activeChat?.agent?.id || activeChat?.agent?._id}
        targetName={`${activeChat?.agent?.firstName || 'Agent'} ${activeChat?.agent?.lastName || ''}`.trim()}
      />
    </div>
  );
}
