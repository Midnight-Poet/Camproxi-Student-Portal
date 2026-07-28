import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router'
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { useGetChatsQuery, useGetChatMessagesQuery, useGetMeQuery, useMarkChatReadMutation, useInitiateChatMutation } from '../../store/apiSlice';
import { useChatSocket } from '../../hooks/useChatSocket';
import { ConversationList } from './components/ConversationList';
import { ChatThread } from './components/ChatThread';
import { AvatarCircle } from '../../components/ui/AvatarCircle';

export function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatIdParam = searchParams.get('chatId');
  const { data: userResponse } = useGetMeQuery();
  const user = userResponse?.data || userResponse;

  const [chatOpen, setChatOpen] = useState(!!activeChatIdParam || searchParams.get('newChat') === 'true');
  const [chatInput, setChatInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate()

  const { data: chatsRes, isLoading: chatsLoading } = useGetChatsQuery(undefined, {
    pollingInterval: 1000
  });
  const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);
  
  // Strictly prevent body scrolling on the Messages page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const isNewChat = searchParams.get('newChat') === 'true';
  const newAgentId = searchParams.get('agentId');
  const newItemId = searchParams.get('itemId');
  const newItemCategory = searchParams.get('category');
  const newAgentName = searchParams.get('name');
  const newAgentAvatar = searchParams.get('avatar');

  const activeChatId = activeChatIdParam || null;
  const activeConv = activeChatId ? chats.find(c => (c.id || c._id) === activeChatId) : isNewChat ? {
    id: 'new',
    agent: { firstName: newAgentName, lastName: '', profileImage: { url: newAgentAvatar } },
    isNew: true,
  } : null;

  // Set up WebSocket connection for this chat
  const { isConnected, sendMessage, markAsRead } = useChatSocket(activeChatId);

  // Fetch paginated messages
  const { data: msgsRes, refetch: refetchMessages } = useGetChatMessagesQuery(activeChatId, { skip: !activeChatId, pollingInterval: 1000 });
  const rawMessages = Array.isArray(msgsRes) ? msgsRes : (msgsRes?.data || []);
  const messages = [...rawMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const [markChatRead] = useMarkChatReadMutation();
  const [initiateChat] = useInitiateChatMutation();



  const dispatch = useDispatch();

  useEffect(() => {
    if (activeChatId) {
      const hasUnread = messages.some(m => m.senderType === 'AGENT' && !m.isRead);
      if (hasUnread) {
        markAsRead();
        markChatRead(activeChatId);
        
        // Optimistically update local cache so we don't spam the API
        dispatch(
          apiSlice.util.updateQueryData('getChatMessages', activeChatId, (draft) => {
            draft.forEach(m => {
              if (m.senderType === 'AGENT') m.isRead = true;
            });
          })
        );
      }
    }
  }, [activeChatId, messages, markChatRead, markAsRead, dispatch]);

  function handleSelectChat(id) {
    setSearchParams({ chatId: id });
    setChatOpen(true);
  }

  function handleBack() {
    setDropdownOpen(false);
    setChatOpen(false);
    setSearchParams({});
  }

  const [pendingMessage, setPendingMessage] = useState(null);

  useEffect(() => {
    if (isConnected && pendingMessage) {
      sendMessage(pendingMessage.text, pendingMessage.userId);
      setPendingMessage(null);
      setTimeout(() => refetchMessages(), 200);
    }
  }, [isConnected, pendingMessage, sendMessage, refetchMessages]);

  async function handleSend() {
    if (!chatInput.trim()) return;

    if (activeConv?.isNew) {
      try {
        const payload = { agentId: newAgentId };
        if (newItemId && newItemId !== 'null' && newItemId !== 'undefined') payload.itemId = newItemId;
        if (newItemCategory && newItemCategory !== 'null' && newItemCategory !== 'undefined') payload.itemCategory = newItemCategory;

        const res = await initiateChat(payload).unwrap();
        const newChatId = res.id || res._id;
        
        // Save the message to be sent once connected
        setPendingMessage({ text: chatInput, userId: userResponse.id });
        setChatInput('');
        
        // Update URL to the new chat
        setSearchParams({ chatId: newChatId });
      } catch (err) {
        console.error('Failed to create chat', err);
      }
      return;
    }

    if (!activeChatId) return;

    // Send via socket.io
    sendMessage(chatInput, userResponse.id);
    
    // Clear input
    setChatInput('');
    
    // Slight delay to allow backend to persist before refetch
    setTimeout(() => {
      refetchMessages();
    }, 200);
  }

  if (chatsLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] md:h-screen bg-slate-50 items-center justify-center">
        <div className="w-10 h-10 border-4 border-cx-border border-t-cx-teal rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-150px)] md:h-[calc(83vh)] bg-white md:bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100 md:border-slate-200 relative">
      {/* Sidebar List */}
      <div 
        className={`w-full md:w-[380px] flex-none bg-white md:border-r border-slate-100 flex flex-col transition-transform duration-300 ${
          chatOpen ? '-translate-x-full md:translate-x-0 absolute md:relative z-0 h-full' : 'translate-x-0 relative z-10'
        }`}
      >
        <div className="p-4 md:p-6 border-b border-slate-100 flex-none bg-white">
          <h1 className="text-2xl font-extrabold text-cx-ink mb-4">Messages</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-50 text-sm border-none rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-cx-teal/20 transition-all text-slate-700 placeholder-slate-400"
            />
            <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="chat_bubble_outline" size={28} style={{ color: '#94a3b8' }} />
              </div>
              <h3 className="text-slate-700 font-bold mb-1">No messages yet</h3>
              <p className="text-sm text-slate-500">When you contact a provider, your conversation will appear here.</p>
            </div>
          ) : (
            <ConversationList chats={chats} activeId={activeChatId} onSelect={handleSelectChat} />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        className={`flex-1 bg-white flex flex-col absolute md:relative w-full h-full z-20 transition-transform duration-300  ${
          chatOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-slate-100 bg-white flex-none shadow-sm z-30 relative">
              <button 
                onClick={handleBack}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-500 border-none bg-transparent"
              >
                <Icon name="arrow_back" size={24} />
              </button>
              
              <AvatarCircle 
                name={activeConv?.agent ? `${activeConv.agent.firstName} ${activeConv.agent.lastName}` : 'Agent'} 
                size={40} 
                imageUrl={activeConv?.agent?.profileImage?.url || activeConv?.agent?.avatar}
              />
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-cx-ink truncate">
                  {activeConv?.agent ? `${activeConv.agent.firstName} ${activeConv.agent.lastName}` : 'Agent'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-semibold text-slate-500 truncate">
                    {activeConv?.agent?.companyName || activeConv?.agent?.businessName || activeConv?.itemCategory || 'Verified Provider'}
                  </p>
                </div>
              </div>

              <div className="relative" onBlur={() => setTimeout(() => setDropdownOpen(false), 500)}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 border-none bg-transparent focus:outline-none"
                >
                  <Icon name="more_vert" size={24} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white transition duration-500 rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <button onMouseDown={handleBack} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium border-none bg-transparent flex items-center gap-2">
                      {/* <Icon name="close" size={18} />  */}
                      Close Chat
                    </button>
                    <button onMouseDown={() => {
                      if (activeConv?.agent?.id) {
                        navigate(`/agent/${activeConv.agent.id}`);
                      }
                    }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium border-none bg-transparent flex items-center gap-2">
                      {/* <Icon name="visibility" size={18} />  */}
                      View Profile
                    </button>
                    <button onMouseDown={() => {}} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium border-none bg-transparent flex items-center gap-2">
                      {/* <Icon name="report_problem" size={18} />  */}
                      Report
                    </button>
                    <button onMouseDown={() => {}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-none bg-transparent flex items-center gap-2">
                      {/* <Icon name="delete" size={18} />  */}
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            <ChatThread 
              messages={messages} 
              activeConv={activeConv} 
              chatInput={chatInput} 
              onInputChange={setChatInput} 
              onSend={handleSend} 
              user={user} 
            />
          </>
        ) : (
          <div className="hidden md:flex h-full flex-col items-center justify-center bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <Icon name="forum" size={32} style={{ color: '#14b8a6' }} />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Your Messages</h2>
            <p className="text-sm text-slate-500 text-center max-w-[250px]">
              Select a conversation to start messaging with providers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
