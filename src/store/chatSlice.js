import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messagesByChat: {}, // { [chatId]: [messages] }
    activeChat: null,
    connected: false,
  },
  reducers: {
    setConnected(state, action) {
      state.connected = action.payload;
    },
    chatOpened(state, action) {
      state.activeChat = action.payload;
    },
    messagesLoaded(state, action) {
      const { chatId, messages } = action.payload;
      // prepend on pagination, or set fresh on first load — adjust as needed
      state.messagesByChat[chatId] = messages;
    },
    messageReceived(state, action) {
      const msg = action.payload;
      if (!state.messagesByChat[msg.chatId]) {
        state.messagesByChat[msg.chatId] = [];
      }
      state.messagesByChat[msg.chatId].push(msg);
    },
    readReceiptUpdated(state, action) {
      const { chatId, readerId } = action.payload;
      const messages = state.messagesByChat[chatId];
      if (!messages) return;
      messages.forEach((m) => {
        if (m.senderId !== readerId) m.isRead = true;
      });
    },
  },
});

export const {
  setConnected,
  chatOpened,
  messagesLoaded,
  messageReceived,
  readReceiptUpdated,
} = chatSlice.actions;

export default chatSlice.reducer;