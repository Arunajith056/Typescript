/**
 * Advanced State Management with TypeScript
 * Redux-style state management with full type safety
 */

// ==================== CORE TYPES ====================

// Action interface
interface Action {
  type: string;
  payload?: any;
}

// Reducer function type
type Reducer<T> = (state: T | undefined, action: Action) => T;

// Middleware function type
type Middleware<T> = (
  store: { getState: () => T; dispatch: (action: Action) => void }
) => (next: (action: Action) => void) => (action: Action) => void;

// Subscription callback
type Listener<T> = (state: T) => void;

// ==================== APPLICATION STATE ====================

// User state
interface UserState {
  currentUser: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Posts state
interface PostState {
  posts: Array<{
    id: number;
    title: string;
    content: string;
    authorId: number;
    tags: string[];
    published: boolean;
    createdAt: string;
  }>;
  currentPost: PostState['posts'][0] | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    authorId?: number;
    published?: boolean;
    tags?: string[];
  };
}

// UI state
interface UIState {
  theme: 'light' | 'dark';
  sidebar: {
    isOpen: boolean;
    selectedItem: string | null;
  };
  modal: {
    isOpen: boolean;
    type: 'create-post' | 'edit-user' | 'confirm-delete' | null;
    data: any;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
}

// Root application state
interface AppState {
  user: UserState;
  posts: PostState;
  ui: UIState;
}

// ==================== ACTION CREATORS ====================

// User actions
const userActions = {
  // Login actions
  loginRequest: () => ({ type: 'USER_LOGIN_REQUEST' as const }),
  loginSuccess: (user: UserState['currentUser']) => ({
    type: 'USER_LOGIN_SUCCESS' as const,
    payload: user
  }),
  loginFailure: (error: string) => ({
    type: 'USER_LOGIN_FAILURE' as const,
    payload: error
  }),
  
  // Logout
  logout: () => ({ type: 'USER_LOGOUT' as const }),
  
  // Update user
  updateUser: (user: Partial<NonNullable<UserState['currentUser']>>) => ({
    type: 'USER_UPDATE' as const,
    payload: user
  })
} as const;

// Post actions
const postActions = {
  // Fetch posts
  fetchPostsRequest: () => ({ type: 'POSTS_FETCH_REQUEST' as const }),
  fetchPostsSuccess: (posts: PostState['posts']) => ({
    type: 'POSTS_FETCH_SUCCESS' as const,
    payload: posts
  }),
  fetchPostsFailure: (error: string) => ({
    type: 'POSTS_FETCH_FAILURE' as const,
    payload: error
  }),
  
  // Create post
  createPost: (post: Omit<PostState['posts'][0], 'id' | 'createdAt'>) => ({
    type: 'POSTS_CREATE' as const,
    payload: post
  }),
  
  // Update post
  updatePost: (id: number, updates: Partial<PostState['posts'][0]>) => ({
    type: 'POSTS_UPDATE' as const,
    payload: { id, updates }
  }),
  
  // Delete post
  deletePost: (id: number) => ({
    type: 'POSTS_DELETE' as const,
    payload: id
  }),
  
  // Set current post
  setCurrentPost: (post: PostState['currentPost']) => ({
    type: 'POSTS_SET_CURRENT' as const,
    payload: post
  }),
  
  // Set filters
  setFilters: (filters: PostState['filters']) => ({
    type: 'POSTS_SET_FILTERS' as const,
    payload: filters
  })
} as const;

// UI actions
const uiActions = {
  // Theme
  toggleTheme: () => ({ type: 'UI_TOGGLE_THEME' as const }),
  setTheme: (theme: UIState['theme']) => ({
    type: 'UI_SET_THEME' as const,
    payload: theme
  }),
  
  // Sidebar
  toggleSidebar: () => ({ type: 'UI_TOGGLE_SIDEBAR' as const }),
  setSidebarItem: (item: string | null) => ({
    type: 'UI_SET_SIDEBAR_ITEM' as const,
    payload: item
  }),
  
  // Modal
  openModal: (type: UIState['modal']['type'], data?: any) => ({
    type: 'UI_OPEN_MODAL' as const,
    payload: { type, data }
  }),
  closeModal: () => ({ type: 'UI_CLOSE_MODAL' as const }),
  
  // Notifications
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => ({
    type: 'UI_ADD_NOTIFICATION' as const,
    payload: {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
  }),
  removeNotification: (id: string) => ({
    type: 'UI_REMOVE_NOTIFICATION' as const,
    payload: id
  })
} as const;

// Extract action types
type UserAction = ReturnType<typeof userActions[keyof typeof userActions]>;
type PostAction = ReturnType<typeof postActions[keyof typeof postActions]>;
type UIAction = ReturnType<typeof uiActions[keyof typeof uiActions]>;
type AppAction = UserAction | PostAction | UIAction;

// ==================== REDUCERS ====================

// User reducer
const userReducer: Reducer<UserState> = (state = {
  currentUser: null,
  isLoading: false,
  error: null
}, action) => {
  switch (action.type) {
    case 'USER_LOGIN_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'USER_LOGIN_SUCCESS':
      return { ...state, currentUser: action.payload, isLoading: false, error: null };
    
    case 'USER_LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'USER_LOGOUT':
      return { ...state, currentUser: null, error: null };
    
    case 'USER_UPDATE':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null
      };
    
    default:
      return state;
  }
};

// Posts reducer
const postsReducer: Reducer<PostState> = (state = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  filters: {}
}, action) => {
  switch (action.type) {
    case 'POSTS_FETCH_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'POSTS_FETCH_SUCCESS':
      return { ...state, posts: action.payload, isLoading: false, error: null };
    
    case 'POSTS_FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'POSTS_CREATE': {
      const newPost = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      return { ...state, posts: [...state.posts, newPost] };
    }
    
    case 'POSTS_UPDATE':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id
            ? { ...post, ...action.payload.updates }
            : post
        )
      };
    
    case 'POSTS_DELETE':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        currentPost: state.currentPost?.id === action.payload ? null : state.currentPost
      };
    
    case 'POSTS_SET_CURRENT':
      return { ...state, currentPost: action.payload };
    
    case 'POSTS_SET_FILTERS':
      return { ...state, filters: action.payload };
    
    default:
      return state;
  }
};

// UI reducer
const uiReducer: Reducer<UIState> = (state = {
  theme: 'light',
  sidebar: { isOpen: false, selectedItem: null },
  modal: { isOpen: false, type: null, data: null },
  notifications: []
}, action) => {
  switch (action.type) {
    case 'UI_TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    
    case 'UI_SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'UI_TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen }
      };
    
    case 'UI_SET_SIDEBAR_ITEM':
      return {
        ...state,
        sidebar: { ...state.sidebar, selectedItem: action.payload }
      };
    
    case 'UI_OPEN_MODAL':
      return {
        ...state,
        modal: { isOpen: true, type: action.payload.type, data: action.payload.data }
      };
    
    case 'UI_CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, type: null, data: null }
      };
    
    case 'UI_ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'UI_REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Root reducer
const rootReducer: Reducer<AppState> = (state, action) => ({
  user: userReducer(state?.user, action),
  posts: postsReducer(state?.posts, action),
  ui: uiReducer(state?.ui, action)
});

// ==================== STORE IMPLEMENTATION ====================

class Store<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private middlewares: Middleware<T>[] = [];

  constructor(
    private reducer: Reducer<T>,
    initialState?: T,
    middlewares: Middleware<T>[] = []
  ) {
    this.middlewares = middlewares;
    this.state = reducer(initialState, { type: '@@INIT' });
  }

  getState(): T {
    return this.state;
  }

  dispatch = (action: Action): void => {
    // Apply middlewares
    const middlewareAPI = {
      getState: this.getState.bind(this),
      dispatch: this.dispatch
    };

    const chain = this.middlewares.map(middleware => middleware(middlewareAPI));
    const composedMiddleware = chain.reduce(
      (a, b) => (next: (action: Action) => void) => a(b(next))
    );

    const dispatchWithMiddleware = composedMiddleware((action: Action) => {
      this.state = this.reducer(this.state, action);
      this.notifyListeners();
    });

    dispatchWithMiddleware(action);
  };

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// ==================== MIDDLEWARE ====================

// Logger middleware
const loggerMiddleware: Middleware<AppState> = ({ getState }) => next => action => {
  console.group(`Action: ${action.type}`);
  console.log('Previous State:', getState());
  console.log('Action:', action);
  next(action);
  console.log('Next State:', getState());
  console.groupEnd();
};

// Async middleware (thunk-like)
type AsyncAction<T> = (dispatch: (action: Action) => void, getState: () => T) => void | Promise<void>;

const asyncMiddleware: Middleware<AppState> = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return (action as AsyncAction<AppState>)(dispatch, getState);
  }
  return next(action);
};

// ==================== SELECTORS ====================

// User selectors
const userSelectors = {
  getCurrentUser: (state: AppState) => state.user.currentUser,
  isUserLoading: (state: AppState) => state.user.isLoading,
  getUserError: (state: AppState) => state.user.error,
  isAuthenticated: (state: AppState) => state.user.currentUser !== null,
  isAdmin: (state: AppState) => state.user.currentUser?.role === 'admin'
};

// Posts selectors
const postSelectors = {
  getAllPosts: (state: AppState) => state.posts.posts,
  getCurrentPost: (state: AppState) => state.posts.currentPost,
  getPostsLoading: (state: AppState) => state.posts.isLoading,
  getPostsError: (state: AppState) => state.posts.error,
  getFilteredPosts: (state: AppState) => {
    const { posts, filters } = state.posts;
    return posts.filter(post => {
      if (filters.authorId && post.authorId !== filters.authorId) return false;
      if (filters.published !== undefined && post.published !== filters.published) return false;
      if (filters.tags && !filters.tags.some(tag => post.tags.includes(tag))) return false;
      return true;
    });
  },
  getPostsByAuthor: (state: AppState, authorId: number) =>
    state.posts.posts.filter(post => post.authorId === authorId)
};

// UI selectors
const uiSelectors = {
  getTheme: (state: AppState) => state.ui.theme,
  isSidebarOpen: (state: AppState) => state.ui.sidebar.isOpen,
  getSelectedSidebarItem: (state: AppState) => state.ui.sidebar.selectedItem,
  isModalOpen: (state: AppState) => state.ui.modal.isOpen,
  getModalType: (state: AppState) => state.ui.modal.type,
  getModalData: (state: AppState) => state.ui.modal.data,
  getNotifications: (state: AppState) => state.ui.notifications
};

// ==================== ASYNC ACTIONS ====================

// Simulate API calls
const apiService = {
  async login(email: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'admin@example.com' && password === 'admin') {
      return {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const
      };
    }
    throw new Error('Invalid credentials');
  },

  async fetchPosts() {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 1,
        title: 'Introduction to TypeScript',
        content: 'TypeScript is a powerful...',
        authorId: 1,
        tags: ['typescript', 'programming'],
        published: true,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 2,
        title: 'Advanced React Patterns',
        content: 'React patterns for scalable...',
        authorId: 1,
        tags: ['react', 'javascript'],
        published: true,
        createdAt: '2026-01-02T00:00:00Z'
      }
    ];
  }
};

// Async action creators
const asyncActions = {
  login: (email: string, password: string): AsyncAction<AppState> =>
    async (dispatch) => {
      dispatch(userActions.loginRequest());
      try {
        const user = await apiService.login(email, password);
        dispatch(userActions.loginSuccess(user));
        dispatch(uiActions.addNotification({
          type: 'success',
          message: 'Login successful!'
        }));
      } catch (error) {
        dispatch(userActions.loginFailure(error instanceof Error ? error.message : 'Login failed'));
        dispatch(uiActions.addNotification({
          type: 'error',
          message: 'Login failed. Please check your credentials.'
        }));
      }
    },

  fetchPosts: (): AsyncAction<AppState> =>
    async (dispatch) => {
      dispatch(postActions.fetchPostsRequest());
      try {
        const posts = await apiService.fetchPosts();
        dispatch(postActions.fetchPostsSuccess(posts));
      } catch (error) {
        dispatch(postActions.fetchPostsFailure('Failed to fetch posts'));
      }
    }
};

// ==================== STORE SETUP ====================

// Create store with middleware
const store = new Store<AppState>(
  rootReducer,
  undefined,
  [loggerMiddleware, asyncMiddleware]
);

// ==================== USAGE EXAMPLE ====================

export function demonstrateStateManagement() {
  console.log('=== State Management Demo ==>');

  // Subscribe to state changes
  const unsubscribe = store.subscribe((state) => {
    console.log('State updated:', {
      isAuthenticated: userSelectors.isAuthenticated(state),
      postsCount: postSelectors.getAllPosts(state).length,
      theme: uiSelectors.getTheme(state),
      notifications: uiSelectors.getNotifications(state).length
    });
  });

  // Simulate user interactions
  store.dispatch(uiActions.setTheme('dark'));
  store.dispatch(uiActions.toggleSidebar());
  store.dispatch(uiActions.addNotification({
    type: 'info',
    message: 'Welcome to the application!'
  }));

  // Simulate async login
  (store.dispatch as any)(asyncActions.login('admin@example.com', 'admin'));
  
  // Simulate creating a post
  setTimeout(() => {
    store.dispatch(postActions.createPost({
      title: 'My New Post',
      content: 'This is the content...',
      authorId: 1,
      tags: ['typescript'],
      published: true
    }));
  }, 1500);

  // Clean up after demo
  setTimeout(() => {
    unsubscribe();
    console.log('Demo completed');
  }, 3000);
}

console.log('Advanced state management system loaded!');

export {
  store,
  userActions,
  postActions,
  uiActions,
  asyncActions,
  userSelectors,
  postSelectors,
  uiSelectors,
  Store
};

export type {
  AppState,
  UserState,
  PostState,
  UIState,
  AppAction,
  UserAction,
  PostAction,
  UIAction,
  Middleware,
  AsyncAction
};