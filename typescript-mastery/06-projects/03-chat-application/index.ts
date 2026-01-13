/**
 * Real-time Chat Application with TypeScript
 * Demonstrates WebSocket connections, real-time communication, and message handling
 */

// ==================== CORE TYPES ====================

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: Date;
  isTyping?: boolean;
}

type UserStatus = 'online' | 'away' | 'busy' | 'offline';

interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  channelId: string;
  timestamp: Date;
  editedAt?: Date;
  reactions: Reaction[];
  mentions: string[]; // user IDs
  attachments: Attachment[];
  metadata?: MessageMetadata;
}

type MessageType = 'text' | 'image' | 'file' | 'system' | 'typing' | 'voice';

interface Reaction {
  emoji: string;
  userIds: string[];
  count: number;
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

interface MessageMetadata {
  readBy: { userId: string; timestamp: Date }[];
  deliveredTo: string[];
  edited: boolean;
  deleted: boolean;
  parentMessageId?: string; // For threaded replies
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  memberIds: string[];
  ownerId: string;
  isPrivate: boolean;
  settings: ChannelSettings;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

type ChannelType = 'text' | 'voice' | 'direct' | 'group';

interface ChannelSettings {
  allowFiles: boolean;
  allowImages: boolean;
  allowVoice: boolean;
  messageRetention: number; // days
  slowMode: number; // seconds between messages
  roles: {
    admin: string[];
    moderator: string[];
    member: string[];
  };
}

// ==================== WEBSOCKET EVENTS ====================

interface WebSocketEvents {
  // Connection events
  'connected': { user: User };
  'disconnected': { userId: string };
  
  // Message events
  'message:send': { message: Omit<Message, 'id' | 'timestamp'> };
  'message:receive': { message: Message };
  'message:edit': { messageId: string; content: string };
  'message:delete': { messageId: string; channelId: string };
  'message:reaction:add': { messageId: string; emoji: string; userId: string };
  'message:reaction:remove': { messageId: string; emoji: string; userId: string };
  
  // Typing events
  'typing:start': { userId: string; channelId: string };
  'typing:stop': { userId: string; channelId: string };
  
  // Channel events
  'channel:join': { channelId: string; userId: string };
  'channel:leave': { channelId: string; userId: string };
  'channel:create': { channel: Channel };
  'channel:update': { channelId: string; changes: Partial<Channel> };
  
  // User events
  'user:status:change': { userId: string; status: UserStatus };
  'user:profile:update': { userId: string; changes: Partial<User> };
  
  // System events
  'error': { code: string; message: string; details?: any };
  'reconnect': { attempt: number };
}

type WebSocketEventListener<K extends keyof WebSocketEvents> = 
  (data: WebSocketEvents[K]) => void | Promise<void>;

// ==================== WEBSOCKET CLIENT ====================

class ChatWebSocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<keyof WebSocketEvents, Set<Function>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private pingInterval: number | null = null;
  private isConnected = false;

  constructor(
    private url: string,
    private token: string
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);
        
        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.stopPing();
          
          if (event.code !== 1000) { // Not normal closure
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.emit('error', {
            code: 'WEBSOCKET_ERROR',
            message: 'WebSocket connection error',
            details: error
          });
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000); // Normal closure
      this.ws = null;
    }
    this.stopPing();
  }

  on<K extends keyof WebSocketEvents>(
    event: K, 
    listener: WebSocketEventListener<K>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => this.off(event, listener);
  }

  off<K extends keyof WebSocketEvents>(
    event: K, 
    listener: WebSocketEventListener<K>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  emit<K extends keyof WebSocketEvents>(event: K, data: WebSocketEvents[K]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }));
    }

    // Also notify local listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(async (listener) => {
        try {
          await listener(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${String(event)}:`, error);
        }
      });
    }
  }

  private handleMessage(rawData: string): void {
    try {
      const { type, data } = JSON.parse(rawData);
      
      const eventListeners = this.listeners.get(type);
      if (eventListeners) {
        eventListeners.forEach(async (listener) => {
          try {
            await listener(data);
          } catch (error) {
            console.error(`Error handling WebSocket event ${type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        this.emit('reconnect', { attempt: this.reconnectAttempts });
        this.connect().catch(() => {
          this.handleReconnect();
        });
      }, delay);
    } else {
      this.emit('error', {
        code: 'MAX_RECONNECT_ATTEMPTS',
        message: 'Maximum reconnection attempts reached'
      });
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000) as any; // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  getConnectionStatus(): { connected: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts
    };
  }
}

// ==================== MESSAGE SERVICE ====================

class MessageService {
  private messageCache = new Map<string, Message[]>(); // channelId -> messages
  private typingUsers = new Map<string, Set<string>>(); // channelId -> userIds

  constructor(
    private wsClient: ChatWebSocketClient,
    private currentUserId: string
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wsClient.on('message:receive', ({ message }) => {
      this.addMessageToCache(message);
    });

    this.wsClient.on('message:edit', ({ messageId, content }) => {
      this.updateMessageInCache(messageId, { content, editedAt: new Date() });
    });

    this.wsClient.on('message:delete', ({ messageId, channelId }) => {
      this.removeMessageFromCache(channelId, messageId);
    });

    this.wsClient.on('typing:start', ({ userId, channelId }) => {
      if (userId !== this.currentUserId) {
        this.addTypingUser(channelId, userId);
      }
    });

    this.wsClient.on('typing:stop', ({ userId, channelId }) => {
      this.removeTypingUser(channelId, userId);
    });
  }

  async sendMessage(
    channelId: string, 
    content: string, 
    type: MessageType = 'text',
    attachments: Attachment[] = []
  ): Promise<void> {
    const message: Omit<Message, 'id' | 'timestamp'> = {
      content,
      type,
      senderId: this.currentUserId,
      channelId,
      reactions: [],
      mentions: this.extractMentions(content),
      attachments,
      metadata: {
        readBy: [],
        deliveredTo: [],
        edited: false,
        deleted: false
      }
    };

    this.wsClient.emit('message:send', { message });
  }

  async editMessage(messageId: string, newContent: string): Promise<void> {
    this.wsClient.emit('message:edit', { messageId, content: newContent });
  }

  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    this.wsClient.emit('message:delete', { messageId, channelId });
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    this.wsClient.emit('message:reaction:add', {
      messageId,
      emoji,
      userId: this.currentUserId
    });
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    this.wsClient.emit('message:reaction:remove', {
      messageId,
      emoji,
      userId: this.currentUserId
    });
  }

  startTyping(channelId: string): void {
    this.wsClient.emit('typing:start', {
      userId: this.currentUserId,
      channelId
    });
  }

  stopTyping(channelId: string): void {
    this.wsClient.emit('typing:stop', {
      userId: this.currentUserId,
      channelId
    });
  }

  getChannelMessages(channelId: string): Message[] {
    return this.messageCache.get(channelId) || [];
  }

  getTypingUsers(channelId: string): string[] {
    const typingSet = this.typingUsers.get(channelId);
    return typingSet ? Array.from(typingSet) : [];
  }

  private addMessageToCache(message: Message): void {
    const channelMessages = this.messageCache.get(message.channelId) || [];
    channelMessages.push(message);
    
    // Keep only last 100 messages in cache
    if (channelMessages.length > 100) {
      channelMessages.splice(0, channelMessages.length - 100);
    }
    
    this.messageCache.set(message.channelId, channelMessages);
  }

  private updateMessageInCache(messageId: string, updates: Partial<Message>): void {
    for (const [channelId, messages] of this.messageCache.entries()) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        const updatedMessage = { ...messages[messageIndex], ...updates } as Message;
        this.messageCache.set(channelId, [
          ...messages.slice(0, messageIndex),
          updatedMessage,
          ...messages.slice(messageIndex + 1)
        ]);
        break;
      }
    }
  }

  private removeMessageFromCache(channelId: string, messageId: string): void {
    const messages = this.messageCache.get(channelId);
    if (messages) {
      this.messageCache.set(
        channelId,
        messages.filter(m => m.id !== messageId)
      );
    }
  }

  private addTypingUser(channelId: string, userId: string): void {
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set());
    }
    this.typingUsers.get(channelId)!.add(userId);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeTypingUser(channelId, userId);
    }, 3000);
  }

  private removeTypingUser(channelId: string, userId: string): void {
    const typingSet = this.typingUsers.get(channelId);
    if (typingSet) {
      typingSet.delete(userId);
    }
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match[1]) {
        mentions.push(match[1]);
      }
    }
    
    return mentions;
  }
}

// ==================== CHANNEL SERVICE ====================

class ChannelService {
  private channels = new Map<string, Channel>();
  private currentChannelId: string | null = null;

  constructor(private wsClient: ChatWebSocketClient) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wsClient.on('channel:create', ({ channel }) => {
      this.channels.set(channel.id, channel);
    });

    this.wsClient.on('channel:update', ({ channelId, changes }) => {
      const channel = this.channels.get(channelId);
      if (channel) {
        this.channels.set(channelId, { ...channel, ...changes, updatedAt: new Date() });
      }
    });

    this.wsClient.on('channel:join', ({ channelId, userId }) => {
      const channel = this.channels.get(channelId);
      if (channel && !channel.memberIds.includes(userId)) {
        channel.memberIds.push(userId);
      }
    });

    this.wsClient.on('channel:leave', ({ channelId, userId }) => {
      const channel = this.channels.get(channelId);
      if (channel) {
        channel.memberIds = channel.memberIds.filter(id => id !== userId);
      }
    });
  }

  async createChannel(
    name: string,
    type: ChannelType = 'text',
    isPrivate = false,
    description?: string
  ): Promise<string> {
    const channelId = generateId();
    const channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      type,
      memberIds: [],
      ownerId: '', // Will be set by server
      isPrivate,
      settings: {
        allowFiles: true,
        allowImages: true,
        allowVoice: type === 'voice',
        messageRetention: 30,
        slowMode: 0,
        roles: {
          admin: [],
          moderator: [],
          member: []
        }
      },
      unreadCount: 0,
      ...(description && { description })
    };
    
    const channel: Channel = {
      id: channelId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...channelData
    };

    this.wsClient.emit('channel:create', { channel });
    return channelId;
  }

  async joinChannel(channelId: string): Promise<void> {
    this.wsClient.emit('channel:join', { channelId, userId: '' }); // Server will fill userId
    this.currentChannelId = channelId;
  }

  async leaveChannel(channelId: string): Promise<void> {
    this.wsClient.emit('channel:leave', { channelId, userId: '' });
    if (this.currentChannelId === channelId) {
      this.currentChannelId = null;
    }
  }

  getCurrentChannel(): Channel | null {
    return this.currentChannelId ? this.channels.get(this.currentChannelId) || null : null;
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  getChannel(channelId: string): Channel | null {
    return this.channels.get(channelId) || null;
  }
}

// ==================== CHAT APPLICATION ====================

class ChatApplication {
  private wsClient: ChatWebSocketClient;
  private messageService: MessageService;
  private channelService: ChannelService;
  private currentUser: User | null = null;

  constructor(
    websocketUrl: string,
    authToken: string,
    currentUser: User
  ) {
    this.currentUser = currentUser;
    this.wsClient = new ChatWebSocketClient(websocketUrl, authToken);
    this.messageService = new MessageService(this.wsClient, currentUser.id);
    this.channelService = new ChannelService(this.wsClient);
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wsClient.on('connected', ({ user }) => {
      console.log(`Connected as ${user.username}`);
    });

    this.wsClient.on('error', ({ code, message, details }) => {
      console.error(`WebSocket error [${code}]: ${message}`, details);
    });

    this.wsClient.on('reconnect', ({ attempt }) => {
      console.log(`Reconnection attempt ${attempt}`);
    });
  }

  async connect(): Promise<void> {
    await this.wsClient.connect();
  }

  disconnect(): void {
    this.wsClient.disconnect();
  }

  // Message operations
  async sendMessage(channelId: string, content: string): Promise<void> {
    return this.messageService.sendMessage(channelId, content);
  }

  async sendImage(channelId: string, file: File): Promise<void> {
    // In a real app, you'd upload the file first
    const attachment: Attachment = {
      id: generateId(),
      type: 'image',
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type
    };

    return this.messageService.sendMessage(
      channelId, 
      `Shared an image: ${file.name}`,
      'image',
      [attachment]
    );
  }

  getMessages(channelId: string): Message[] {
    return this.messageService.getChannelMessages(channelId);
  }

  // Channel operations
  async createChannel(name: string, isPrivate = false): Promise<string> {
    return this.channelService.createChannel(name, 'text', isPrivate);
  }

  async joinChannel(channelId: string): Promise<void> {
    return this.channelService.joinChannel(channelId);
  }

  getCurrentChannel(): Channel | null {
    return this.channelService.getCurrentChannel();
  }

  getAllChannels(): Channel[] {
    return this.channelService.getAllChannels();
  }

  // Typing indicators
  startTyping(channelId: string): void {
    this.messageService.startTyping(channelId);
  }

  stopTyping(channelId: string): void {
    this.messageService.stopTyping(channelId);
  }

  getTypingUsers(channelId: string): string[] {
    return this.messageService.getTypingUsers(channelId);
  }

  // Status updates
  updateStatus(status: UserStatus): void {
    if (this.currentUser) {
      this.currentUser.status = status;
      this.wsClient.emit('user:status:change', {
        userId: this.currentUser.id,
        status
      });
    }
  }

  getConnectionStatus(): { connected: boolean; attempts: number } {
    return this.wsClient.getConnectionStatus();
  }
}

// ==================== UTILITIES ====================

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// ==================== EXAMPLE USAGE ====================

async function createChatApp() {
  const user: User = {
    id: 'user_123',
    username: 'john_doe',
    email: 'john@example.com',
    status: 'online',
    lastSeen: new Date()
  };

  const app = new ChatApplication(
    'ws://localhost:8080',
    'auth_token_123',
    user
  );

  try {
    await app.connect();
    
    // Create a channel
    const channelId = await app.createChannel('general', false);
    await app.joinChannel(channelId);
    
    // Send a message
    await app.sendMessage(channelId, 'Hello, everyone! 👋');
    
    console.log('Chat app initialized successfully');
    return app;
  } catch (error) {
    console.error('Failed to initialize chat app:', error);
    throw error;
  }
}

export {
  ChatApplication,
  ChatWebSocketClient,
  MessageService,
  ChannelService,
  createChatApp
};

export type {
  User,
  Message,
  Channel,
  Attachment,
  WebSocketEvents,
  MessageType,
  ChannelType,
  UserStatus
};