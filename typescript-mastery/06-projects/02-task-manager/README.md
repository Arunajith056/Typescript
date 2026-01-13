# Task Management System

A comprehensive TypeScript project demonstrating state management, event systems, and real-time features for task management applications.

## Architecture Overview

This project showcases advanced TypeScript patterns in a real-world application:

- **Domain-Driven Design**: Clear separation between business logic and infrastructure
- **Event-Driven Architecture**: Pub/sub pattern for loose coupling
- **State Management**: Redux-like pattern with type safety
- **Optimistic Updates**: Better UX with rollback capabilities
- **Type-Safe APIs**: End-to-end type safety from client to server

## Key TypeScript Features Demonstrated

### 1. Advanced Type Definitions
```typescript
// Union types for strict business rules
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

// Complex interfaces with nested structures
interface Project {
  settings: ProjectSettings;
  memberIds: string[];
  // ...
}
```

### 2. Generic Event System
```typescript
interface EventMap {
  'task:created': { task: Task; user: User };
  'task:updated': { task: Task; changes: Partial<Task>; user: User };
}

class EventEmitter<TEventMap extends Record<string, any> = EventMap> {
  on<K extends keyof TEventMap>(event: K, listener: EventListener<K>): () => void;
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void;
}
```

### 3. Type-Safe State Management
```typescript
type StateAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; changes: Partial<Task> } };

class StateManager {
  private reducer(state: AppState, action: StateAction): AppState;
}
```

### 4. Service Layer with Dependency Injection
```typescript
class TaskService {
  constructor(
    private stateManager: StateManager,
    private eventEmitter: EventEmitter,
    private apiClient: ApiClient
  ) {}
}
```

## Core Components

### Domain Models
- **Task**: Core entity with status, priority, and assignment tracking
- **Project**: Container for tasks with settings and member management
- **User**: User entity with preferences and role-based access

### Event System
- Type-safe pub/sub pattern
- Automatic error handling
- Subscription management with cleanup

### State Management
- Redux-like architecture
- Immutable updates
- Optimistic updates with rollback

### API Integration
- Type-safe HTTP client
- Error handling
- Response type inference

## Usage Example

```typescript
// Initialize the application
const app = await createTaskManagerApp();

// Create a new task
const task = await app.taskService.createTask({
  title: 'Design mockups',
  description: 'Create initial design mockups for homepage',
  status: 'todo',
  priority: 'high',
  projectId: 'proj1',
  labels: ['design', 'frontend'],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  estimatedHours: 8,
  createdBy: 'user1'
});

// Listen to events
app.eventEmitter.on('task:created', ({ task, user }) => {
  console.log(`Task "${task.title}" created by ${user.name}`);
});

// Subscribe to state changes
app.stateManager.subscribe(state => {
  console.log('Tasks:', state.tasks.length);
  console.log('Current project:', state.currentProject?.name);
});
```

## Advanced Patterns

### 1. Optimistic Updates
The TaskService implements optimistic updates for better user experience:
- Immediately update local state
- Send API request in background
- Rollback changes if API fails

### 2. Event-Driven Notifications
Automatic notification system based on domain events:
```typescript
eventEmitter.on('task:completed', ({ task, user }) => {
  // Auto-generate completion notification
});
```

### 3. Type-Safe Filtering
Complex filtering system with full type safety:
```typescript
interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  // ...
}
```

### 4. Modular Architecture
Clean separation of concerns:
- Domain models (pure TypeScript interfaces)
- Services (business logic)
- State management (application state)
- API clients (infrastructure)

## Running the Project

```bash
# Install dependencies
npm install

# Run TypeScript compiler
npx tsc index.ts

# Run the compiled JavaScript
node index.js
```

## Extension Ideas

1. **Real-time Updates**: Add WebSocket support for collaborative editing
2. **Offline Support**: Implement service worker for offline functionality
3. **Plugin System**: Create extensible plugin architecture
4. **Testing**: Add comprehensive test suite with Jest
5. **Performance**: Implement virtual scrolling for large task lists

## Learning Outcomes

This project demonstrates:
- Complex type definitions and constraints
- Generic programming patterns
- Event-driven architecture
- State management patterns
- Error handling and recovery
- Type-safe API integration
- Modular architecture design