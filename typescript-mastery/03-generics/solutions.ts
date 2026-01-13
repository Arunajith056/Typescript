/**
 * Generic Solutions
 * Complete implementations for all generic exercises
 */

// ==================== BASIC GENERIC SOLUTIONS ====================

// Solution 1: Swap function
function swap<T>(a: T, b: T): [T, T] {
  return [b, a];
}

// Test cases
const [x, y] = swap(1, 2); // [2, 1]
const [str1, str2] = swap("hello", "world"); // ["world", "hello"]

// Solution 2: Generic cache class
class Cache<T> {
  private data = new Map<string, T>();

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  set(key: string, value: T): void {
    this.data.set(key, value);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}

// Solution 3: Result type for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

function createError<E>(error: E): Result<never, E> {
  return { success: false, error };
}

function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

// Solution 4: Generic array utilities
function first<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

function last<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

function take<T>(arr: T[], count: number): T[] {
  return arr.slice(0, count);
}

function drop<T>(arr: T[], count: number): T[] {
  return arr.slice(count);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ==================== CONSTRAINT SOLUTIONS ====================

// Solution 5: Find by id with constraint
function findById<T extends { id: string | number }>(items: T[], id: T['id']): T | undefined {
  return items.find(item => item.id === id);
}

// Solution 6: Merge objects
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// Solution 7: Sort by property
function sortBy<T, K extends keyof T>(items: T[], key: K, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ==================== ADVANCED GENERIC SOLUTIONS ====================

// Solution 8: Generic event emitter
class EventEmitter<TEventMap extends Record<string, any>> {
  private listeners = new Map<keyof TEventMap, Set<Function>>();

  on<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  removeAllListeners<K extends keyof TEventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

interface UserEvents {
  login: { userId: string; timestamp: Date };
  logout: { userId: string };
  update: { userId: string; changes: object };
}

const userEmitter = new EventEmitter<UserEvents>();

// Solution 9: Generic state manager
class StateManager<T> {
  private state: T;
  private listeners = new Set<(state: T) => void>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  setStateFunction(updater: (prevState: T) => T): void {
    this.state = updater(this.state);
    this.notifyListeners();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Solution 10: Generic validator
type ValidationRule<T> = {
  validate: (value: T) => boolean | string;
  message?: string;
};

type ValidationResult<T> = {
  isValid: boolean;
  errors: Partial<Record<keyof T, string[]>>;
};

class Validator<T extends Record<string, any>> {
  private rules = new Map<keyof T, ValidationRule<T[keyof T]>[]>();

  addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    (this.rules.get(field)! as ValidationRule<any>[]).push(rule);
    return this;
  }

  validate(data: T): ValidationResult<T> {
    const errors: Partial<Record<keyof T, string[]>> = {};
    let isValid = true;

    for (const [field, fieldRules] of this.rules) {
      const fieldErrors: string[] = [];
      const value = data[field];

      for (const rule of fieldRules) {
        const result = rule.validate(value);
        if (result !== true) {
          fieldErrors.push(typeof result === 'string' ? result : rule.message || 'Validation failed');
          isValid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return { isValid, errors };
  }
}

// ==================== UTILITY TYPE SOLUTIONS ====================

// Solution 11: Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedUser {
  id: number;
  profile: {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

type PartialNestedUser = DeepPartial<NestedUser>;

// Solution 12: Pick by type
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

type UserStrings = PickByType<User, string>; // { name: string; email: string; }
type UserNumbers = PickByType<User, number>; // { id: number; age: number; }

// Solution 13: Function overloader
type Overload<T> = T extends {
  (...args: infer A1): infer R1;
  (...args: infer A2): infer R2;
  (...args: infer A3): infer R3;
} ? {
  (...args: A1): R1;
  (...args: A2): R2;
  (...args: A3): R3;
} : T extends {
  (...args: infer A1): infer R1;
  (...args: infer A2): infer R2;
} ? {
  (...args: A1): R1;
  (...args: A2): R2;
} : T;

// ==================== API DESIGN SOLUTIONS ====================

// Solution 14: Type-safe API client
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: any;
  response: any;
}

type ApiClient<TApi extends Record<string, ApiEndpoint>> = {
  [K in keyof TApi]: TApi[K]['method'] extends 'GET' | 'DELETE'
    ? (params?: Record<string, any>) => Promise<TApi[K]['response']>
    : (body: TApi[K]['body'], params?: Record<string, any>) => Promise<TApi[K]['response']>;
};

interface BlogApi extends Record<string, ApiEndpoint> {
  getPosts: {
    method: 'GET';
    path: '/posts';
    response: Array<{ id: number; title: string; content: string }>;
  };
  createPost: {
    method: 'POST';
    path: '/posts';
    body: { title: string; content: string };
    response: { id: number; title: string; content: string };
  };
  updatePost: {
    method: 'PUT';
    path: '/posts/:id';
    body: { title?: string; content?: string };
    response: { id: number; title: string; content: string };
  };
}

type BlogApiClient = ApiClient<BlogApi>;

// Solution 15: Database query builder
interface QueryBuilder<T> {
  where<K extends keyof T>(field: K, operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte', value: T[K]): QueryBuilder<T>;
  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>>;
  orderBy<K extends keyof T>(field: K, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
  first(): Promise<T | null>;
}

function createQueryBuilder<T>(): QueryBuilder<T> {
  const state = {
    wheres: [] as any[],
    selects: [] as any[],
    orders: [] as any[],
    limitCount: undefined as number | undefined,
    offsetCount: 0
  };

  return {
    where(field, operator, value) {
      state.wheres.push({ field, operator, value });
      return this;
    },
    select(...fields) {
      state.selects = fields;
      return this as any;
    },
    orderBy(field, direction = 'asc') {
      state.orders.push({ field, direction });
      return this;
    },
    limit(count) {
      state.limitCount = count;
      return this;
    },
    offset(count) {
      state.offsetCount = count;
      return this;
    },
    async execute() {
      console.log('Executing query with state:', state);
      return [] as any;
    },
    async first() {
      console.log('Executing first query with state:', state);
      return null as any;
    }
  };
}

// Solution 16: Form builder
type FormFieldType = 'text' | 'email' | 'number' | 'checkbox' | 'select';

type FormField<T> = {
  type: T extends string ? 'text' | 'email' : T extends number ? 'number' : T extends boolean ? 'checkbox' : 'text';
  label: string;
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule<T>[];
} & (T extends boolean ? {} : { defaultValue?: T });

type FormBuilder<T> = {
  [K in keyof T]: FormField<T[K]>;
};

interface ContactForm {
  name: string;
  email: string;
  age: number;
  subscribe: boolean;
}

type ContactFormBuilder = FormBuilder<ContactForm>;

// ==================== EXAMPLE IMPLEMENTATIONS ====================

// Example usage of solutions
const stringCache = new Cache<string>();
stringCache.set('user:1', 'John Doe');
console.log('Cached user:', stringCache.get('user:1'));

const numbers = [1, 2, 3, 4, 5];
console.log('First:', first(numbers));
console.log('Last:', last(numbers));
console.log('Take 3:', take(numbers, 3));
console.log('Drop 2:', drop(numbers, 2));

const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 }
];

console.log('Find by ID:', findById(users, 2));
console.log('Sorted by age:', sortBy(users, 'age'));

const userValidator = new Validator<ContactForm>()
  .addRule('name', { validate: v => v.length >= 2, message: 'Name too short' })
  .addRule('email', { validate: v => v.includes('@'), message: 'Invalid email' })
  .addRule('age', { validate: v => v >= 18, message: 'Must be 18+' });

const validationResult = userValidator.validate({
  name: 'John',
  email: 'john@example.com',
  age: 25,
  subscribe: true
});

console.log('Validation result:', validationResult);

const appState = new StateManager<{ user: { name: string } | null; loading: boolean }>({ user: null, loading: false });
const unsubscribe = appState.subscribe(state => console.log('State changed:', state));

appState.setState({ loading: true });
appState.setState({ user: { name: 'John' }, loading: false });

console.log('Generic solutions loaded and tested successfully!');

export {
  swap,
  Cache,
  createSuccess,
  createError,
  isSuccess,
  first,
  last,
  take,
  drop,
  chunk,
  findById,
  merge,
  sortBy,
  EventEmitter,
  StateManager,
  Validator,
  createQueryBuilder
};

export type {
  Result,
  DeepPartial,
  PickByType,
  Overload,
  ApiEndpoint,
  ApiClient,
  QueryBuilder,
  FormField,
  FormBuilder,
  ValidationRule,
  ValidationResult
};