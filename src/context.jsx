import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { INITIAL_ACTIVITY } from './data.js';

const AppContext = createContext(null);

const initialState = {
  isAuthenticated: false,
  onbStep: 0,
  email: '',
  code: '',
  saved: { l1:true, f1:true, s2:true },
  settings: { newListings:true, priceDrops:true, interestUpdates:true, promos:false, locationServices:true, showActivity:true },
  prefs: { campus:'Crystal Campus', currency:'₦ Naira', distance:'Kilometres', language:'English' },
  profileForm: { name:'Amara Okonkwo', username:'amara_o', bio:'200L · Computer Science. Looking for a quiet self-con near campus.', email:'amara@unilag.edu.ng', phone:'+234 803 555 0142' },
  catFilter: 'Lodge',
  campusFilter: 'All',
  distanceFilter: 'Any distance',
  exploreMode: 'list',
  isSideNavOpen: false,
  activity: INITIAL_ACTIVITY,
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
      return { ...initialState, activity: INITIAL_ACTIVITY };
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
      return { ...state, profileForm: { ...state.profileForm, [action.field]: action.value } };
    case 'SET_CAT_FILTER':
      return { ...state, catFilter: action.value };
    case 'SET_CAMPUS_FILTER':
      return { ...state, campusFilter: action.value };
    case 'SET_DISTANCE_FILTER':
      return { ...state, distanceFilter: action.value };
    case 'SET_EXPLORE_MODE':
      return { ...state, exploreMode: action.value };
    case 'TOGGLE_SIDENAV':
      return { ...state, isSideNavOpen: !state.isSideNavOpen };

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

    case 'SHOW_TOAST':
      return { 
        ...state, 
        toast: { 
          message: action.message, 
          position: action.position || 'bottom',
          type: action.toastType || 'default',
          title: action.title || null
        } 
      };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showToast = useCallback((message, options = {}) => {
    dispatch({ 
      type: 'SHOW_TOAST', 
      message, 
      position: options.position,
      toastType: options.type,
      title: options.title
    });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
