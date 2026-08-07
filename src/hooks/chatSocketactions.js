import { getSocket } from '../lib/socket.js';

export function joinChat(chatId) {
  getSocket().emit('joinChat', { chatId });
}

export function sendMessage(chatId, content) {
  getSocket().emit('sendMessage', { chatId, content });
}