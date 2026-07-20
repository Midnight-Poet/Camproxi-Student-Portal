import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { INITIAL_CONVERSATIONS, INITIAL_ACTIVITY } from './data.js';

const AppContext = createContext(null);

const AUTO_REPLIES = [
  "Thanks for reaching out! We'll get back to you shortly.",
  "Got it! Give us a moment to process your request.",
  "Thank you! We appreciate your interest.",
  "Sure, we'll look into that and respond soon.",
  "Received! We'll confirm the details shortly.",
];

const initialState = {
  isAuthenticated: false,
  onbStep: 0,
  email: '',
  code: '',
  saved: { l1:true, f1:true, s2:true },
  settings: { newListings:true, priceDrops:true, interestUpdates:true, messages:true, promos:false, locationServices:true, showActivity:true },
  prefs: { campus:'Crystal Campus', currency:'₦ Naira', distance:'Kilometres', language:'English' },
  profileForm: { name:'Amara Okonkwo', username:'amara_o', bio:'200L · Computer Science. Looking for a quiet self-con near campus.', email:'amara@unilag.edu.ng', phone:'+234 803 555 0142' },
  catFilter: 'Lodge',
  exploreMode: 'list',
  isSideNavOpen: false,
  conversations: INITIAL_CONVERSATIONS,
  activeChatId: 'c1',
  activity: INITIAL_ACTIVITY,
  chatInput: '',
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.value };
    case 'SET_CODE':
      return { ...state, code: action.value };
    case 'NEXT_ONB':
      return { ...state, onbStep: Math.min(state.onbStep + 1, 3) };
    case 'PREV_ONB':
      return { ...state, onbStep: Math.max(state.onbStep - 1, 0) };
    case 'COMPLETE_ONB':
      return { ...state, isAuthenticated: true, onbStep: 0 };
    case 'LOGOUT':
      return { ...initialState, conversations: INITIAL_CONVERSATIONS, activity: INITIAL_ACTIVITY };
    case 'TOGGLE_SAVED': {
      const saved = { ...state.saved };
      if (saved[action.id]) {
        delete saved[action.id];
      } else {
        saved[action.id] = true;
      }
      return { ...state, saved };
    }
    case 'TOGGLE_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: !state.settings[action.key] } };
    case 'SET_PREF':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case 'SET_PROFILE_FIELD':
      return { ...state, profileForm: { ...state.profileForm, [action.key]: action.value } };
    case 'SET_CAT_FILTER':
      return { ...state, catFilter: action.value };
    case 'SET_EXPLORE_MODE':
      return { ...state, exploreMode: action.value };
    case 'TOGGLE_SIDENAV':
      return { ...state, isSideNavOpen: !state.isSideNavOpen };
    case 'OPEN_CHAT':
      return {
        ...state,
        activeChatId: action.id,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, unread: 0 } : c
        ),
      };
    case 'OPEN_CHAT_WITH': {
      const existing = state.conversations.find(c => c.name === action.name && c.listing === action.listing);
      if (existing) {
        return {
          ...state,
          activeChatId: existing.id,
          conversations: state.conversations.map(c =>
            c.id === existing.id ? { ...c, unread: 0 } : c
          ),
        };
      }
      const newId = 'c' + Date.now();
      const newConv = {
        id: newId,
        name: action.name,
        listing: action.listing,
        kind: action.kind || 'business',
        time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }),
        unread: 0,
        msgs: [
          { from:'them', t:`Hello! Thanks for your interest in ${action.listing}.`, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }) },
        ],
      };
      return {
        ...state,
        activeChatId: newId,
        conversations: [newConv, ...state.conversations],
      };
    }
    case 'SEND_MESSAGE': {
      const now = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.chatId
            ? { ...c, msgs: [...c.msgs, { from:'me', t: action.text, time: now }], time: now }
            : c
        ),
        chatInput: '',
      };
    }
    case 'RECEIVE_MESSAGE': {
      const now = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.chatId
            ? { ...c, msgs: [...c.msgs, { from:'them', t: action.text, time: now }], time: now }
            : c
        ),
      };
    }
    case 'ADD_ACTIVITY': {
      const newActivity = {
        id: 'a' + Date.now(),
        name: action.name,
        type: action.actType,
        status: 'Pending',
        when: 'Just now',
      };
      return { ...state, activity: [newActivity, ...state.activity] };
    }
    case 'SET_CHAT_INPUT':
      return { ...state, chatInput: action.value };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, position: action.position || 'bottom' } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showToast = useCallback((message, options = {}) => {
    dispatch({ type: 'SHOW_TOAST', message, position: options.position });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2200);
  }, []);

  const sendChat = useCallback((chatId, text) => {
    if (!text.trim()) return;
    dispatch({ type: 'SEND_MESSAGE', chatId, text });
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() => {
      dispatch({ type: 'RECEIVE_MESSAGE', chatId, text: reply });
    }, 1100);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast, sendChat }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
