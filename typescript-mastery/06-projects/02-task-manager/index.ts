/**
 * Task Management System with TypeScript
 * Demonstrates state management, event systems, and real-time features
 */

// ==================== CORE DOMAIN TYPES ====================

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId: string;
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  ownerId: string;
  memberIds: string[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectSettings {
  allowGuests: boolean;
  defaultTaskPriority: TaskPriority;
  workflowStates: TaskStatus[];
  notifications: {
    emailUpdates: boolean;
    slackIntegration: boolean;
    webhookUrl?: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  preferences: UserPreferences;
  lastActive: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
  };
}

// ==================== EVENT SYSTEM ====================

interface EventMap {
  'task:created': { task: Task; user: User };
  'task:updated': { task: Task; changes: Partial<Task>; user: User };
  'task:deleted': { taskId: string; user: User };
  'task:assigned': { task: Task; assignee: User; user: User };
  'task:completed': { task: Task; user: User };
  'project:created': { project: Project; user: User };
  'project:updated': { project: Project; changes: Partial<Project>; user: User };
  'user:joined': { project: Project; user: User };
  'user:left': { project: Project; user: User };
  'notification:sent': { type: string; recipient: User; data: any };
}

type EventListener<K extends keyof EventMap> = (data: EventMap[K]) => void | Promise<void>;

class EventEmitter<TEventMap extends EventMap = EventMap> {
  private listeners = new Map<keyof TEventMap, Set<Function>>();

  on<K extends keyof TEventMap & keyof EventMap>(event: K, listener: EventListener<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<K extends keyof TEventMap & keyof EventMap>(event: K, listener: EventListener<K>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(async (listener) => {
        try {
          await listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: keyof TEventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// ==================== STATE MANAGEMENT ====================

interface AppState {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  currentProject: Project | null;
  selectedTasks: string[];
  filters: TaskFilters;
  ui: UIState;
}

interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  search?: string;
  labels?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

interface UIState {
  sidebarOpen: boolean;
  activeView: 'board' | 'list' | 'calendar';
  loading: boolean;
  notifications: Notification[];
  modals: {
    createTask: boolean;
    editTask: boolean;
    projectSettings: boolean;
  };
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

// State management with Redux-like pattern
type StateAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; changes: Partial<Project> } }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; changes: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_SELECTED_TASKS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'SET_UI_STATE'; payload: Partial<UIState> }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string };

class StateManager {
  private state: AppState;
  private listeners = new Set<(state: AppState) => void>();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): AppState {
    return {
      user: null,
      projects: [],
      tasks: [],
      currentProject: null,
      selectedTasks: [],
      filters: {},
      ui: {
        sidebarOpen: true,
        activeView: 'board',
        loading: false,
        notifications: [],
        modals: {
          createTask: false,
          editTask: false,
          projectSettings: false
        }
      }
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  dispatch(action: StateAction): void {
    this.state = this.reducer(this.state, action);
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private reducer(state: AppState, action: StateAction): AppState {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, user: action.payload };
        
      case 'SET_PROJECTS':
        return { ...state, projects: action.payload };
        
      case 'ADD_PROJECT':
        return { ...state, projects: [...state.projects, action.payload] };
        
      case 'UPDATE_PROJECT':
        return {
          ...state,
          projects: state.projects.map(p => 
            p.id === action.payload.id 
              ? { ...p, ...action.payload.changes, updatedAt: new Date() }
              : p
          )
        };
        
      case 'SET_TASKS':
        return { ...state, tasks: action.payload };
        
      case 'ADD_TASK':
        return { ...state, tasks: [...state.tasks, action.payload] };
        
      case 'UPDATE_TASK':
        return {
          ...state,
          tasks: state.tasks.map(t => 
            t.id === action.payload.id 
              ? { ...t, ...action.payload.changes, updatedAt: new Date() }
              : t
          )
        };
        
      case 'DELETE_TASK':
        return {
          ...state,
          tasks: state.tasks.filter(t => t.id !== action.payload),
          selectedTasks: state.selectedTasks.filter(id => id !== action.payload)
        };
        
      case 'SET_CURRENT_PROJECT':
        return { ...state, currentProject: action.payload };
        
      case 'SET_SELECTED_TASKS':
        return { ...state, selectedTasks: action.payload };
        
      case 'SET_FILTERS':
        return { ...state, filters: { ...state.filters, ...action.payload } };
        
      case 'SET_UI_STATE':
        return { ...state, ui: { ...state.ui, ...action.payload } };
        
      case 'ADD_NOTIFICATION':
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, action.payload]
          }
        };
        
      case 'MARK_NOTIFICATION_READ':
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.map(n =>
              n.id === action.payload ? { ...n, read: true } : n
            )
          }
        };
        
      default:
        return state;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// ==================== TASK SERVICE ====================

class TaskService {
  constructor(
    private stateManager: StateManager,
    private eventEmitter: EventEmitter,
    private apiClient: ApiClient
  ) {}

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      id: generateId(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Optimistic update
    this.stateManager.dispatch({ type: 'ADD_TASK', payload: task });

    try {
      // API call
      const savedTask = await this.apiClient.post<Task>('/tasks', task);
      
      // Update with server response
      this.stateManager.dispatch({
        type: 'UPDATE_TASK',
        payload: { id: task.id, changes: savedTask }
      });

      // Emit event
      const state = this.stateManager.getState();
      this.eventEmitter.emit('task:created', { 
        task: savedTask, 
        user: state.user! 
      });

      return savedTask;
    } catch (error) {
      // Rollback on error
      this.stateManager.dispatch({ type: 'DELETE_TASK', payload: task.id });
      throw error;
    }
  }

  async updateTask(taskId: string, changes: Partial<Task>): Promise<Task> {
    const state = this.stateManager.getState();
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Optimistic update
    this.stateManager.dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, changes }
    });

    try {
      const updatedTask = await this.apiClient.put<Task>(`/tasks/${taskId}`, changes);
      
      this.stateManager.dispatch({
        type: 'UPDATE_TASK',
        payload: { id: taskId, changes: updatedTask }
      });

      this.eventEmitter.emit('task:updated', {
        task: updatedTask,
        changes,
        user: state.user!
      });

      return updatedTask;
    } catch (error) {
      // Rollback
      this.stateManager.dispatch({
        type: 'UPDATE_TASK',
        payload: { id: taskId, changes: task }
      });
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const state = this.stateManager.getState();
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Optimistic update
    this.stateManager.dispatch({ type: 'DELETE_TASK', payload: taskId });

    try {
      await this.apiClient.delete(`/tasks/${taskId}`);
      
      this.eventEmitter.emit('task:deleted', {
        taskId,
        user: state.user!
      });
    } catch (error) {
      // Rollback
      this.stateManager.dispatch({ type: 'ADD_TASK', payload: task });
      throw error;
    }
  }

  getFilteredTasks(): Task[] {
    const state = this.stateManager.getState();
    let tasks = state.tasks;

    // Apply current project filter
    if (state.currentProject) {
      tasks = tasks.filter(t => t.projectId === state.currentProject!.id);
    }

    // Apply filters
    const { filters } = state;
    
    if (filters.status?.length) {
      tasks = tasks.filter(t => filters.status!.includes(t.status));
    }

    if (filters.priority?.length) {
      tasks = tasks.filter(t => filters.priority!.includes(t.priority));
    }

    if (filters.assigneeId) {
      tasks = tasks.filter(t => t.assigneeId === filters.assigneeId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    if (filters.labels?.length) {
      tasks = tasks.filter(t => 
        filters.labels!.some(label => t.labels.includes(label))
      );
    }

    return tasks;
  }
}

// ==================== API CLIENT ====================

interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete(url: string): Promise<void>;
}

class ApiClientImpl implements ApiClient {
  private baseUrl = 'https://api.taskmanager.com';

  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async delete(url: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
}

// ==================== UTILITIES ====================

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// ==================== EXAMPLE APPLICATION ====================

async function createTaskManagerApp() {
  const stateManager = new StateManager();
  const eventEmitter = new EventEmitter();
  const apiClient = new ApiClientImpl();
  const taskService = new TaskService(stateManager, eventEmitter, apiClient);

  // Set up event listeners
  eventEmitter.on('task:created', ({ task, user }) => {
    stateManager.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: generateId(),
        type: 'success',
        title: 'Task Created',
        message: `"${task.title}" was created successfully`,
        timestamp: new Date(),
        read: false
      }
    });
  });

  eventEmitter.on('task:completed', ({ task, user }) => {
    stateManager.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: generateId(),
        type: 'info',
        title: 'Task Completed',
        message: `"${task.title}" was marked as done`,
        timestamp: new Date(),
        read: false
      }
    });
  });

  // Initialize with sample data
  const sampleProject: Project = {
    id: 'proj1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'active',
    ownerId: 'user1',
    memberIds: ['user1', 'user2'],
    settings: {
      allowGuests: false,
      defaultTaskPriority: 'medium',
      workflowStates: ['todo', 'in_progress', 'review', 'done'],
      notifications: {
        emailUpdates: true,
        slackIntegration: false
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const sampleUser: User = {
    id: 'user1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'admin',
    preferences: {
      theme: 'light',
      timezone: 'America/New_York',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      workingHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York'
      }
    },
    lastActive: new Date()
  };

  stateManager.dispatch({ type: 'SET_USER', payload: sampleUser });
  stateManager.dispatch({ type: 'SET_PROJECTS', payload: [sampleProject] });
  stateManager.dispatch({ type: 'SET_CURRENT_PROJECT', payload: sampleProject });

  // Create sample tasks
  await taskService.createTask({
    title: 'Design mockups',
    description: 'Create initial design mockups for homepage',
    status: 'todo',
    priority: 'high',
    projectId: sampleProject.id,
    labels: ['design', 'frontend'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    estimatedHours: 8,
    createdBy: sampleUser.id
  });

  await taskService.createTask({
    title: 'Set up development environment',
    description: 'Configure build tools and development server',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: sampleUser.id,
    projectId: sampleProject.id,
    labels: ['setup', 'development'],
    estimatedHours: 4,
    createdBy: sampleUser.id
  });

  return {
    stateManager,
    eventEmitter,
    taskService,
    apiClient
  };
}

// Example usage
createTaskManagerApp().then(app => {
  console.log('Task Manager App initialized');
  
  // Subscribe to state changes
  app.stateManager.subscribe(state => {
    console.log('State updated:', {
      tasksCount: state.tasks.length,
      projectsCount: state.projects.length,
      currentProject: state.currentProject?.name,
      notifications: state.ui.notifications.length
    });
  });
});

export {
  TaskService,
  StateManager,
  EventEmitter,
  ApiClientImpl,
  createTaskManagerApp
};

export type {
  Task,
  Project,
  User,
  TaskStatus,
  TaskPriority,
  AppState,
  TaskFilters,
  EventMap,
  StateAction,
  ApiClient
};