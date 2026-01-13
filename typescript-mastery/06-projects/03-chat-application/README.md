# Real-time Chat Application

A comprehensive TypeScript project demonstrating real-time communication, WebSocket management, and message handling patterns.

## Architecture Overview

This chat application showcases advanced TypeScript patterns for real-time applications:

- **WebSocket Management**: Connection handling, reconnection, and error recovery
- **Real-time Communication**: Bidirectional message flow with type safety
- **Event-Driven Architecture**: Clean separation using pub/sub patterns
- **Message Management**: Caching, editing, reactions, and threading
- **Typing Indicators**: Real-time user activity feedback
- **Connection Resilience**: Automatic reconnection with exponential backoff

## Key TypeScript Features Demonstrated

### 1. Advanced WebSocket Event System
```typescript
interface WebSocketEvents {
  'message:send': { message: Omit<Message, 'id' | 'timestamp'> };
  'message:receive': { message: Message };
  'typing:start': { userId: string; channelId: string };
}

class ChatWebSocketClient {
  on<K extends keyof WebSocketEvents>(
    event: K, 
    listener: WebSocketEventListener<K>
  ): () => void;
}
```

### 2. Complex Message Types
```typescript
interface Message {
  id: string;
  content: string;
  type: MessageType;
  reactions: Reaction[];
  mentions: string[];
  attachments: Attachment[];
  metadata?: MessageMetadata;
}

type MessageType = 'text' | 'image' | 'file' | 'system' | 'typing' | 'voice';
```

### 3. Service Layer Architecture
```typescript
class MessageService {
  constructor(
    private wsClient: ChatWebSocketClient,
    private currentUserId: string
  ) {}
  
  async sendMessage(channelId: string, content: string): Promise<void>;
  async editMessage(messageId: string, newContent: string): Promise<void>;
}
```

### 4. Real-time State Management
```typescript
class ChatApplication {
  private messageService: MessageService;
  private channelService: ChannelService;
  private wsClient: ChatWebSocketClient;
}
```

## Core Components

### WebSocket Client (`ChatWebSocketClient`)
- **Connection Management**: Connect, disconnect, reconnect with exponential backoff
- **Event System**: Type-safe event emission and listening
- **Error Handling**: Comprehensive error recovery and reporting
- **Heartbeat**: Automatic ping/pong to maintain connection

### Message Service (`MessageService`)
- **Message Operations**: Send, edit, delete, react to messages
- **Typing Indicators**: Start/stop typing with automatic cleanup
- **Message Caching**: Efficient local storage with size limits
- **Mention Detection**: Automatic @username parsing

### Channel Service (`ChannelService`)
- **Channel Management**: Create, join, leave channels
- **Member Management**: Track channel membership
- **Channel Types**: Text, voice, direct messages, groups

### Chat Application (`ChatApplication`)
- **Unified API**: Single interface for all chat operations
- **User Management**: Status updates and profile management
- **File Handling**: Image and file attachment support

## Advanced Features

### 1. Connection Resilience
```typescript
private handleReconnect(): void {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect().catch(() => this.handleReconnect());
    }, delay);
  }
}
```

### 2. Typing Indicators
```typescript
startTyping(channelId: string): void {
  this.wsClient.emit('typing:start', {
    userId: this.currentUserId,
    channelId
  });
}

// Auto-remove after 3 seconds
setTimeout(() => {
  this.removeTypingUser(channelId, userId);
}, 3000);
```

### 3. Message Reactions
```typescript
interface Reaction {
  emoji: string;
  userIds: string[];
  count: number;
}

async addReaction(messageId: string, emoji: string): Promise<void> {
  this.wsClient.emit('message:reaction:add', {
    messageId,
    emoji,
    userId: this.currentUserId
  });
}
```

### 4. File Attachments
```typescript
interface Attachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}
```

## Usage Examples

### Basic Setup
```typescript
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

await app.connect();
```

### Channel Operations
```typescript
// Create and join a channel
const channelId = await app.createChannel('general', false);
await app.joinChannel(channelId);

// Send messages
await app.sendMessage(channelId, 'Hello, everyone! 👋');
await app.sendMessage(channelId, 'How is everyone doing?');

// Get channel messages
const messages = app.getMessages(channelId);
console.log(`Channel has ${messages.length} messages`);
```

### Real-time Features
```typescript
// Typing indicators
app.startTyping(channelId);
// User types...
app.stopTyping(channelId);

// Check who's typing
const typingUsers = app.getTypingUsers(channelId);
console.log(`${typingUsers.length} users are typing...`);

// Status updates
app.updateStatus('away');
```

### File Sharing
```typescript
// Send an image
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files[0];

if (file && file.type.startsWith('image/')) {
  await app.sendImage(channelId, file);
}
```

## WebSocket Events

### Message Events
- `message:send` - Send a new message
- `message:receive` - Receive a message
- `message:edit` - Edit existing message
- `message:delete` - Delete a message
- `message:reaction:add/remove` - Add/remove reactions

### Typing Events
- `typing:start` - User starts typing
- `typing:stop` - User stops typing

### Channel Events
- `channel:create` - Create new channel
- `channel:join/leave` - Join/leave channel
- `channel:update` - Update channel settings

### Connection Events
- `connected/disconnected` - Connection status
- `reconnect` - Reconnection attempts
- `error` - Error handling

## Error Handling

The application includes comprehensive error handling:
- Connection failures with automatic retry
- Message delivery confirmation
- Graceful degradation during network issues
- User-friendly error messages

## Performance Optimizations

- **Message Caching**: Keep only recent messages in memory
- **Lazy Loading**: Load older messages on demand
- **Debounced Typing**: Prevent excessive typing events
- **Connection Pooling**: Efficient WebSocket management

## Testing Strategy

```typescript
// Mock WebSocket for testing
class MockWebSocket implements WebSocket {
  // Implementation for unit tests
}

// Test message service
const mockWS = new MockWebSocket();
const messageService = new MessageService(mockWS, 'user123');
```

## Production Considerations

1. **Security**: Implement proper authentication and authorization
2. **Scalability**: Use Redis for multi-server message broadcasting
3. **Monitoring**: Add metrics for connection health and message latency
4. **Rate Limiting**: Prevent spam and abuse
5. **Data Persistence**: Store messages in database
6. **Offline Support**: Queue messages when offline

## Extension Ideas

1. **Voice/Video Calls**: WebRTC integration
2. **Message Threading**: Threaded conversations
3. **Bot Integration**: Automated responses
4. **Message Search**: Full-text search capabilities
5. **Push Notifications**: Mobile and desktop notifications
6. **Encryption**: End-to-end message encryption

## Learning Outcomes

This project demonstrates:
- Real-time communication patterns
- WebSocket connection management
- Event-driven architecture design
- Complex type definitions and constraints
- Error handling and recovery strategies
- Performance optimization techniques
- Service-oriented architecture