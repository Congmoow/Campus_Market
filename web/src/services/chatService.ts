import { api } from './apiClient';
import { resolveAsset } from '../utils/url';

export interface ConversationDto {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageFromPeer?: string;
  unreadCount?: number;
  userId: number;
  peerId: number;
  threadId: number;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  fromMe: boolean;
  content: string;
  time: string;
}

export const chatService = {
  async getConversations(): Promise<ConversationDto[]> {
    const { data } = await api.get('/v1/chat/conversations');
    return (data || []).map((c: ConversationDto) => ({
      ...c,
      avatar: resolveAsset(c?.avatar),
    }));
  },
  async getMessages(conversationId: number, page = 0, size = 50): Promise<MessageDto[]> {
    const { data } = await api.get(`/v1/chat/conversations/${conversationId}/messages`, { params: { page, size } });
    return data;
  },
  async markRead(conversationId: number): Promise<void> {
    await api.post(`/v1/chat/conversations/${conversationId}/read`);
  },
  async sendMessage(conversationId: number, content: string): Promise<MessageDto> {
    const { data } = await api.post(`/v1/chat/conversations/${conversationId}/messages`, { content });
    return data;
  }
  ,
  async openConversation(params: { peerId: number; name?: string; avatar?: string }): Promise<ConversationDto> {
    const { data } = await api.post('/v1/chat/open', params);
    return {
      ...data,
      avatar: resolveAsset(data?.avatar),
    } as ConversationDto;
  }
};


